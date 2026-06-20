import { createVerificationClient } from "./create-verification-client.mjs";
import "./load-local-env.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";
const targetEmail = process.env.AUTH_EMAIL_TO || process.env.GMAIL_SMTP_TO || process.env.SMTP_TO || process.env.GMAIL_ADDRESS;
const testPassword = process.env.AUTH_EMAIL_TEST_PASSWORD || `Test-${Date.now()}-aA1!`;
const shouldResend = process.env.AUTH_EMAIL_RESEND === "true";
const shouldUseAlias = process.env.AUTH_EMAIL_USE_ALIAS === "true";
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

function buildAlias(email) {
  const [name, domain] = email.split("@");
  if (!name || !domain) {
    throw new Error("AUTH_EMAIL_TO or SMTP_TO must be a valid email address.");
  }

  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const safeName = name.replace(/\+.*/, "");
  return `${safeName}+auth-test-${timestamp}@${domain}`;
}

if (!supabaseUrl || !supabaseAnonKey) {
  fail(
    "Supabase environment configured",
    "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this check",
  );
}

if (!targetEmail) {
  fail(
    "target email configured",
    "set AUTH_EMAIL_TO, GMAIL_SMTP_TO, SMTP_TO, or GMAIL_ADDRESS to the inbox that should receive the confirmation email",
  );
}

if (failures.length === 0) {
  const testEmail = process.env.AUTH_EMAIL_TEST_ADDRESS || (shouldUseAlias ? buildAlias(targetEmail) : targetEmail);
  const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);
  const redirectTo = new URL(siteUrl).toString();

  console.log(`Triggering Supabase auth email for ${redactEmail(testEmail)} with redirect ${redirectTo}`);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          username: "SMTP email verification",
        },
      },
    });

    assert(!error, "Supabase signUp request accepted", error?.message);
    assert(Boolean(data?.user), "Supabase returned a test auth user");

    if (error || !data?.user) {
      console.log("Supabase did not create a test user, so no confirmation email was triggered in this run.");
      console.log("If the detail says rate limit, wait for the Supabase email cooldown and run the command again.");
    } else if (data.session) {
      console.warn("WARN Supabase returned a session immediately. Email confirmation may be disabled for this project.");
    } else {
      pass("Supabase expects email confirmation before login");
    }

    if (!error && data?.user && shouldResend) {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: testEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      assert(!resendError, "Supabase resend confirmation request accepted", resendError?.message);
    } else if (!error && data?.user) {
      pass("Supabase initial confirmation email request was triggered");
      console.log("Skipping immediate resend check. Set AUTH_EMAIL_RESEND=true to test resend after the cooldown.");
    }

    if (!error && data?.user) {
      if (testEmail === targetEmail) {
        console.log(`Check the inbox for ${redactEmail(targetEmail)}.`);
      } else {
        console.log(`Check the inbox for ${redactEmail(testEmail)}. If your mail provider supports plus aliases, it should arrive in ${redactEmail(targetEmail)}.`);
      }
    }
  } catch (error) {
    fail("Supabase auth email request completed", error instanceof Error ? error.message : String(error));
  }
}

if (failures.length > 0) {
  console.error(`\nSupabase auth email verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nSupabase auth email request completed. Inbox delivery must be confirmed manually.");
