import { spawnSync } from "node:child_process";
import "./load-local-env.mjs";

const env = {
  ...process.env,
  EMAIL_STACK_SEND_GMAIL: "true",
  EMAIL_STACK_TRIGGER_PASSWORD_RESET: "true",
};

console.log("Running final email verification.");
console.log("This sends a Gmail SMTP test email and triggers one Supabase password reset email.");

const child = spawnSync(process.execPath, ["scripts/verify-email-stack.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env,
});

process.exit(child.status ?? 1);
