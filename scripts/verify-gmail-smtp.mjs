import { spawnSync } from "node:child_process";

const gmailAddress = process.env.GMAIL_ADDRESS || "hedongshi8@gmail.com";
const appPassword = process.env.GMAIL_APP_PASSWORD;
const to = process.env.GMAIL_SMTP_TO || gmailAddress;
const from = process.env.GMAIL_SMTP_FROM || `Personal Archive <${gmailAddress}>`;
const requestedPort = process.env.GMAIL_SMTP_PORT;

if (!appPassword) {
  console.error("FAIL Gmail app password configured: set GMAIL_APP_PASSWORD before running this check.");
  console.error('Example: $env:GMAIL_APP_PASSWORD="your 16-character app password"; npm run verify:gmail-smtp');
  process.exit(1);
}

const portsToTry = requestedPort ? [requestedPort] : ["465", "587"];
let lastStatus = 1;

for (const port of portsToTry) {
  const secure = port === "465";
  console.log(`Testing Gmail SMTP on port ${port} (${secure ? "TLS" : "STARTTLS"})...`);

  const child = spawnSync(process.execPath, ["scripts/verify-smtp.mjs"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: port,
      SMTP_SECURE: secure ? "true" : "false",
      SMTP_USER: gmailAddress,
      SMTP_PASS: appPassword,
      SMTP_FROM: from,
      SMTP_TO: to,
    },
  });

  lastStatus = child.status ?? 1;
  if (lastStatus === 0) {
    process.exit(0);
  }
}

console.error(`FAIL Gmail SMTP verification failed on ${portsToTry.join(" and ")}.`);
process.exit(lastStatus);
