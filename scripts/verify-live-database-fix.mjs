import { createVerificationClient } from "./create-verification-client.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const failures = [];

const internalPortfolioMatchers = [
  "待替换个人信息",
  "投递说明_只看这个",
  "系统策划投递说明",
  "system-planner-submission-note",
];

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

if (!supabaseUrl || !supabaseAnonKey) {
  fail(
    "Supabase environment configured",
    "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this check",
  );
} else {
  const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);

  const { data: settingsRows, error: settingsError } = await supabase
    .from("site_settings")
    .select("id,site_logo_url")
    .eq("id", "main")
    .limit(1);

  assert(!settingsError, "site_settings.site_logo_url is readable", settingsError?.message);
  assert(Array.isArray(settingsRows), "site settings query returns rows");

  const { data: portfolioItems, error: portfolioError } = await supabase
    .from("portfolio_items")
    .select("id,title,public_url,preview_url,source_path")
    .eq("published", true);

  assert(!portfolioError, "published portfolio items can be checked", portfolioError?.message);

  const internalItems = (portfolioItems ?? []).filter((item) => {
    const searchable = [item.title, item.public_url, item.preview_url, item.source_path].filter(Boolean).join(" ");
    return internalPortfolioMatchers.some((marker) => searchable.includes(marker));
  });

  assert(
    internalItems.length === 0,
    "internal application assembly files are hidden",
    internalItems.length > 0
      ? `${internalItems.length}: ${internalItems.map((item) => `${item.title} (${item.id})`).join(", ")}`
      : "",
  );
}

if (failures.length > 0) {
  console.error(`\nLive database fix verification failed with ${failures.length} issue(s).`);
  console.error("Run `supabase/fix-live-database.sql` in Supabase SQL Editor, then rerun `npm run verify:live-db-fix`.");
  process.exit(1);
}

console.log("\nLive database fix verification passed.");
