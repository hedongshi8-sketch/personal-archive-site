import "./load-local-env.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const gmailAddress = process.env.GMAIL_ADDRESS || "hedongshi8@gmail.com";
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const senderName = process.env.GMAIL_SMTP_SENDER_NAME || "个人策划档案";
const smtpPort = Number.parseInt(process.env.GMAIL_SMTP_PORT || "465", 10);
const siteUrl = process.env.SITE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";

const failures = [];

function fail(label, detail = "") {
  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function pass(label) {
  console.log(`PASS ${label}`);
}

function extractProjectRef(value) {
  try {
    const host = new URL(value).hostname;
    const match = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

if (!supabaseUrl) {
  fail("Supabase project URL configured", "set VITE_SUPABASE_URL in .env or the current terminal");
}

if (!accessToken) {
  fail("Supabase Management API token configured", "set SUPABASE_ACCESS_TOKEN with auth:write permission");
}

if (!gmailAppPassword) {
  fail("Gmail app password configured", "set GMAIL_APP_PASSWORD before running this command");
}

if (!Number.isInteger(smtpPort) || ![465, 587].includes(smtpPort)) {
  fail("Gmail SMTP port is supported", "use GMAIL_SMTP_PORT=465 or GMAIL_SMTP_PORT=587");
}

const projectRef = extractProjectRef(supabaseUrl);
if (!projectRef) {
  fail("Supabase project ref can be derived from VITE_SUPABASE_URL", supabaseUrl || "");
}

if (failures.length > 0) {
  console.error(`\nSupabase Gmail SMTP configuration failed with ${failures.length} issue(s).`);
  process.exit(1);
}

const payload = {
  site_url: siteUrl,
  uri_allow_list: [siteUrl, "https://hedongshi8-sketch.github.io"],
  mailer_autoconfirm: false,
  smtp_admin_email: gmailAddress,
  smtp_host: "smtp.gmail.com",
  smtp_port: smtpPort,
  smtp_user: gmailAddress,
  smtp_pass: gmailAppPassword,
  smtp_sender_name: senderName,
  rate_limit_email_sent: 30,
};

console.log(`Configuring Supabase Auth SMTP for project ${projectRef} with Gmail ${gmailAddress} on port ${smtpPort}.`);

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const detail = await response.text();
  fail("Supabase Auth SMTP configuration accepted", `${response.status} ${detail}`);
  console.error("\nCheck that SUPABASE_ACCESS_TOKEN is a personal access token with auth:write permission for this project.");
  process.exit(1);
}

pass("Supabase Auth SMTP configuration accepted");
console.log("Custom SMTP is now set to Gmail. Run `npm run verify:auth-email` after a short cooldown, then check Gmail inbox/spam.");
