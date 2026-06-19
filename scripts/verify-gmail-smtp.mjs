import { spawnSync } from "node:child_process";

const gmailAddress = process.env.GMAIL_ADDRESS || "hedongshi8@gmail.com";
const appPassword = process.env.GMAIL_APP_PASSWORD;
const to = process.env.GMAIL_SMTP_TO || gmailAddress;
const from = process.env.GMAIL_SMTP_FROM || `Personal Archive <${gmailAddress}>`;

if (!appPassword) {
  console.error("FAIL Gmail app password configured: set GMAIL_APP_PASSWORD before running this check.");
  console.error('Example: $env:GMAIL_APP_PASSWORD="your 16-character app password"; npm run verify:gmail-smtp');
  process.exit(1);
}

const child = spawnSync(process.execPath, ["scripts/verify-smtp.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: gmailAddress,
    SMTP_PASS: appPassword,
    SMTP_FROM: from,
    SMTP_TO: to,
  },
});

process.exit(child.status ?? 1);
