import { spawnSync } from "node:child_process";
import "./load-local-env.mjs";

const shouldSendGmail = process.env.EMAIL_STACK_SEND_GMAIL === "true";
const shouldTriggerAuth = process.env.EMAIL_STACK_TRIGGER_AUTH === "true";
const shouldTriggerPasswordReset = process.env.EMAIL_STACK_TRIGGER_PASSWORD_RESET === "true";
const failures = [];
const warnings = [];

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail = "") {
  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function warn(label, detail = "") {
  warnings.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.warn(`WARN ${label}${detail ? `: ${detail}` : ""}`);
}

function hasValue(key) {
  return Boolean(process.env[key]?.trim());
}

function redactEmail(email) {
  if (!email) {
    return "";
  }

  const [name = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  const visibleName = name.length <= 2 ? `${name[0] ?? ""}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${visibleName}@${domain}`;
}

function runScript(label, scriptPath) {
  console.log(`\nRunning ${label}...`);
  const child = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  if ((child.status ?? 1) !== 0) {
    fail(label, `exited with status ${child.status ?? 1}`);
    return false;
  }

  pass(label);
  return true;
}

const gmailAddress = process.env.GMAIL_ADDRESS || "hedongshi8@gmail.com";
const authEmailTo = process.env.AUTH_EMAIL_TO || process.env.GMAIL_SMTP_TO || process.env.SMTP_TO || process.env.GMAIL_ADDRESS || gmailAddress;

console.log("Checking personal archive email stack configuration...");
console.log(`Gmail account: ${redactEmail(gmailAddress)}`);
console.log(`Auth test inbox: ${redactEmail(authEmailTo) || "not set"}`);

if (hasValue("VITE_SUPABASE_URL") && hasValue("VITE_SUPABASE_ANON_KEY")) {
  pass("Supabase public env is configured");
} else {
  fail("Supabase public env is configured", "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

if (hasValue("GMAIL_ADDRESS")) {
  pass("GMAIL_ADDRESS is configured");
} else {
  warn("GMAIL_ADDRESS is not set", "defaulting to hedongshi8@gmail.com for Gmail SMTP checks");
}

if (hasValue("AUTH_EMAIL_TO") || hasValue("GMAIL_SMTP_TO") || hasValue("SMTP_TO") || hasValue("GMAIL_ADDRESS") || gmailAddress) {
  pass("Auth email test inbox is configured");
} else {
  fail("Auth email test inbox is configured", "set AUTH_EMAIL_TO or GMAIL_ADDRESS");
}

if (hasValue("GMAIL_APP_PASSWORD")) {
  pass("GMAIL_APP_PASSWORD is configured");
} else {
  warn("GMAIL_APP_PASSWORD is not set", "Gmail SMTP send test cannot run yet");
}

if (process.env.AUTH_EMAIL_USE_ALIAS === "true") {
  warn("AUTH_EMAIL_USE_ALIAS is enabled", "confirmation links may create a plus-alias test account");
} else {
  pass("AUTH_EMAIL_USE_ALIAS is disabled");
}

if (shouldSendGmail) {
  if (hasValue("GMAIL_APP_PASSWORD")) {
    runScript("Gmail SMTP send test", "scripts/verify-gmail-smtp.mjs");
  } else {
    fail("Gmail SMTP send test", "EMAIL_STACK_SEND_GMAIL=true requires GMAIL_APP_PASSWORD");
  }
} else {
  console.log("\nSkipping Gmail SMTP send test. Set EMAIL_STACK_SEND_GMAIL=true to send a real SMTP test email.");
}

if (shouldTriggerAuth) {
  if (failures.length === 0 || (failures.length === 1 && failures[0].startsWith("Gmail SMTP send test"))) {
    runScript("Supabase auth confirmation email trigger", "scripts/verify-supabase-auth-email.mjs");
  } else {
    fail("Supabase auth confirmation email trigger", "fix configuration failures before triggering auth email");
  }
} else {
  console.log("Skipping Supabase auth email trigger. Set EMAIL_STACK_TRIGGER_AUTH=true to create a test signup and send a confirmation email.");
}

if (shouldTriggerPasswordReset) {
  if (failures.length === 0 || (failures.length === 1 && failures[0].startsWith("Gmail SMTP send test"))) {
    runScript("Supabase password reset email trigger", "scripts/verify-password-reset-email.mjs");
  } else {
    fail("Supabase password reset email trigger", "fix configuration failures before triggering password reset email");
  }
} else {
  console.log("Skipping Supabase password reset email trigger. Set EMAIL_STACK_TRIGGER_PASSWORD_RESET=true to send a reset email without creating a test account.");
}

if (warnings.length > 0) {
  console.warn(`\nEmail stack check completed with ${warnings.length} warning(s).`);
}

if (failures.length > 0) {
  console.error(`Email stack check failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nEmail stack check passed. For final proof, run with EMAIL_STACK_SEND_GMAIL=true and EMAIL_STACK_TRIGGER_PASSWORD_RESET=true, then confirm inbox delivery.");
