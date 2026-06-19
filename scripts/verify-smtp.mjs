import net from "node:net";
import tls from "node:tls";

const requiredKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "SMTP_TO"];
const missing = requiredKeys.filter((key) => !process.env[key]);

function logPass(label) {
  console.log(`PASS ${label}`);
}

function logFail(label, detail = "") {
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function redact(value) {
  if (!value) {
    return "";
  }

  return value.length <= 6 ? "***" : `${value.slice(0, 3)}***${value.slice(-3)}`;
}

if (missing.length > 0) {
  logFail("SMTP environment configured", `missing ${missing.join(", ")}`);
  console.error("Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO before running this check.");
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const port = Number.parseInt(process.env.SMTP_PORT ?? "", 10);
const secure = process.env.SMTP_SECURE === "true" || port === 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM;
const to = process.env.SMTP_TO;
const timeoutMs = Number.parseInt(process.env.SMTP_TIMEOUT_MS ?? "20000", 10);

if (!Number.isInteger(port) || port <= 0) {
  logFail("SMTP port is valid", process.env.SMTP_PORT);
  process.exit(1);
}

console.log(`Testing SMTP ${host}:${port} secure=${secure} user=${redact(user)} from=${from} to=${to}`);

let socket = await connectSocket({ host, port, secure, timeoutMs });
socket.setTimeout(timeoutMs);

const reader = createLineReader(socket);
await expectCode(reader, 220, "server greeting");

const ehloHost = "personal-archive-site.local";
await command(socket, reader, `EHLO ${ehloHost}`, 250, "EHLO");

if (!secure) {
  await command(socket, reader, `STARTTLS`, 220, "STARTTLS");
  socket = tls.connect({
    socket,
    host,
    servername: host,
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
  });
  socket.setTimeout(timeoutMs);
  const tlsReader = createLineReader(socket);
  await command(socket, tlsReader, `EHLO ${ehloHost}`, 250, "EHLO over TLS");
  await authenticate(socket, tlsReader, user, pass);
  await sendMessage(socket, tlsReader, { from, to });
  await command(socket, tlsReader, "QUIT", 221, "QUIT");
} else {
  await authenticate(socket, reader, user, pass);
  await sendMessage(socket, reader, { from, to });
  await command(socket, reader, "QUIT", 221, "QUIT");
}

logPass("SMTP connection, authentication, and test email send completed");

function connectSocket({ host, port, secure, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const options = {
      host,
      port,
      servername: host,
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    };
    const socket = secure ? tls.connect(options) : net.connect(options);
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`connection timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    socket.once(secure ? "secureConnect" : "connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function createLineReader(socket) {
  let buffer = "";
  const waiters = [];

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    flush();
  });

  socket.on("error", (error) => {
    while (waiters.length) {
      waiters.shift().reject(error);
    }
  });

  socket.on("timeout", () => {
    const error = new Error("SMTP socket timed out");
    socket.destroy(error);
    while (waiters.length) {
      waiters.shift().reject(error);
    }
  });

  function flush() {
    while (waiters.length) {
      const lineEnd = buffer.indexOf("\n");
      if (lineEnd === -1) {
        return;
      }

      const line = buffer.slice(0, lineEnd + 1).replace(/\r?\n$/, "");
      buffer = buffer.slice(lineEnd + 1);
      waiters.shift().resolve(line);
    }
  }

  return {
    nextLine() {
      return new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
        flush();
      });
    },
  };
}

async function readResponse(reader) {
  const lines = [];
  let code = "";

  while (true) {
    const line = await reader.nextLine();
    lines.push(line);
    if (!/^\d{3}[- ]/.test(line)) {
      throw new Error(`invalid SMTP response: ${line}`);
    }

    code = line.slice(0, 3);
    if (line[3] === " ") {
      return { code: Number.parseInt(code, 10), text: lines.join("\n") };
    }
  }
}

async function expectCode(reader, expectedCode, label) {
  const response = await readResponse(reader);
  if (response.code !== expectedCode) {
    throw new Error(`${label} expected ${expectedCode}, got ${response.code}: ${response.text}`);
  }
  logPass(label);
  return response;
}

async function command(socket, reader, value, expectedCode, label) {
  socket.write(`${value}\r\n`);
  return expectCode(reader, expectedCode, label);
}

async function authenticate(socket, reader, user, pass) {
  await command(socket, reader, "AUTH LOGIN", 334, "AUTH LOGIN username challenge");
  await command(socket, reader, Buffer.from(user).toString("base64"), 334, "AUTH LOGIN password challenge");
  await command(socket, reader, Buffer.from(pass).toString("base64"), 235, "SMTP authentication");
}

async function sendMessage(socket, reader, { from, to }) {
  await command(socket, reader, `MAIL FROM:<${extractEmail(from)}>`, 250, "MAIL FROM");
  await command(socket, reader, `RCPT TO:<${extractEmail(to)}>`, 250, "RCPT TO");
  await command(socket, reader, "DATA", 354, "DATA");
  socket.write(buildMessage({ from, to }));
  await expectCode(reader, 250, "test email accepted");
}

function extractEmail(value) {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

function buildMessage({ from, to }) {
  const now = new Date().toUTCString();
  const subject = "Personal archive SMTP test";
  const body = [
    "This is a test email from the personal archive site SMTP verifier.",
    "",
    "If you received this message, the SMTP account can authenticate and send mail.",
  ].join("\r\n");

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${now}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body,
    ".",
    "",
  ].join("\r\n");
}
