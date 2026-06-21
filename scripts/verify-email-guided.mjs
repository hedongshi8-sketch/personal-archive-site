import { spawnSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import "./load-local-env.mjs";

const gmailAddress = process.env.GMAIL_ADDRESS || "hedongshi8@gmail.com";
const targetInbox = process.env.AUTH_EMAIL_TO || process.env.GMAIL_SMTP_TO || process.env.SMTP_TO || gmailAddress;

function redactEmail(email) {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  const visibleName = name.length <= 2 ? `${name[0] ?? ""}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${visibleName}@${domain}`;
}

async function askHidden(question) {
  const rl = readline.createInterface({ input, output });
  const originalWrite = output.write.bind(output);

  output.write = (chunk, encoding, callback) => {
    const text = String(chunk);
    if (text.includes(question)) {
      return originalWrite(chunk, encoding, callback);
    }
    return true;
  };

  try {
    return (await rl.question(question)).trim();
  } finally {
    output.write = originalWrite;
    rl.close();
    output.write("\n");
  }
}

console.log("Guided email verification");
console.log(`Gmail account: ${redactEmail(gmailAddress)}`);
console.log(`Test inbox: ${redactEmail(targetInbox)}`);
console.log("The Gmail App Password is used only for this process and is not written to any file.");

const appPassword = process.env.GMAIL_APP_PASSWORD?.trim() || await askHidden("Paste Gmail App Password: ");

if (!appPassword) {
  console.error("FAIL Gmail App Password is required for final email verification.");
  process.exit(1);
}

const child = spawnSync(process.execPath, ["scripts/verify-email-final.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    GMAIL_ADDRESS: gmailAddress,
    GMAIL_APP_PASSWORD: appPassword,
    AUTH_EMAIL_TO: targetInbox,
  },
});

process.exit(child.status ?? 1);
