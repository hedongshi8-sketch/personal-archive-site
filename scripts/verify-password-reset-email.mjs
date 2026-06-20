import { createVerificationClient } from "./create-verification-client.mjs";
import "./load-local-env.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";
const targetEmail = process.env.PASSWORD_RESET_EMAIL_TO
  || process.env.AUTH_EMAIL_TO
  || process.env.GMAIL_SMTP_TO
  || process.env.SMTP_TO
  || process.env.GMAIL_ADDRESS
  || "hedongshi8@gmail.com";
const failures = [];

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail = "") {
  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function assert(condition, label, detail = "") {
  if (condition) {
    pass(label);
  } else {
    fail(label, detail);
  }
}

function redactEmail(email) {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  const visibleName = name.length <= 2 ? `${name[0] ?? ""}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${visibleName}@${domain}`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  fail(
    "Supabase environment configured",
    "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this check",
  );
}

if (!targetEmail || !targetEmail.includes("@")) {
  fail(
    "password reset inbox configured",
    "set PASSWORD_RESET_EMAIL_TO, AUTH_EMAIL_TO, or GMAIL_ADDRESS to the inbox that should receive the reset email",
  );
}

if (failures.length === 0) {
  const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);
  const redirectTo = new URL(siteUrl).toString();

  console.log(`Triggering Supabase password reset email for ${redactEmail(targetEmail)} with redirect ${redirectTo}`);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo,
    });

    assert(!error, "Supabase password reset email request accepted", error?.message);
    if (!error) {
      pass("password reset email request was triggered without creating a test account");
      console.log(`Check the inbox and spam folder for ${redactEmail(targetEmail)}.`);
    }
  } catch (error) {
    fail("Supabase password reset email request completed", error instanceof Error ? error.message : String(error));
  }
}

if (failures.length > 0) {
  console.error(`\nPassword reset email verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nPassword reset email request completed. Inbox delivery must be confirmed manually.");
