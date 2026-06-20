import { createVerificationClient } from "./create-verification-client.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = process.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";
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

function isNetworkError(error) {
  return /fetch failed|failed to fetch|networkerror/i.test(error?.message ?? "");
}

function assertBlockedByRls(error, label) {
  assert(Boolean(error) && !isNetworkError(error), label, error?.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  fail(
    "Supabase environment configured",
    "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this check",
  );
} else {
  const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);

  const { data: projects, error: projectsError } = await supabase
    .from("portfolio_projects")
    .select("id,title")
    .order("sort_order", { ascending: true });

  assert(!projectsError, "public portfolio projects are readable", projectsError?.message);
  assert((projects?.length ?? 0) === 3, "portfolio project count is 3", `${projects?.length ?? 0}`);

  const { data: items, error: itemsError } = await supabase
    .from("portfolio_items")
    .select("id,title,project_id,kind,public_url,preview_url")
    .eq("published", true);

  assert(!itemsError, "published portfolio items are readable", itemsError?.message);
  assert((items?.length ?? 0) >= 17, "published portfolio item count is at least 17", `${items?.length ?? 0}`);
  const internalPortfolioItems = (items ?? []).filter((item) => {
    const searchable = [item.title, item.public_url, item.preview_url, item.source_path].filter(Boolean).join(" ");
    return /待替换个人信息|投递说明_只看这个|系统策划投递说明/.test(searchable);
  });
  assert(
    internalPortfolioItems.length === 0,
    "published portfolio excludes internal application assembly files",
    internalPortfolioItems.length > 0
      ? `${internalPortfolioItems.length}: ${internalPortfolioItems.map((item) => `${item.title} (${item.id})`).join(", ")}. Run supabase/fix-live-database.sql in Supabase SQL Editor.`
      : "",
  );
  assert(
    (items ?? []).some((item) => item.preview_url?.includes("/portfolio-previews/")),
    "published portfolio items include in-site preview URLs",
  );

  const { error: settingsError } = await supabase
    .from("site_settings")
    .select("id,brand_name,brand_subtitle,hero_title,hero_description,site_logo_url,site_avatar_url,hero_cover_url,background_music_url,background_music_enabled")
    .limit(1);

  assert(!settingsError, "public site settings are readable", settingsError?.message);

  const publicTables = [
    ["music_tracks", "published music tracks are readable"],
    ["gallery_items", "published gallery items are readable"],
    ["reading_notes", "published reading notes are readable"],
  ];

  for (const [tableName, label] of publicTables) {
    const { error } = await supabase.from(tableName).select("id").eq("published", true).limit(1);
    assert(!error, label, error?.message);
  }

  const { error: anonymousCommentError } = await supabase
    .from("public_comments")
    .insert({
      author: "anonymous visitor",
      body: "this comment should be blocked because comments require auth",
      client_elapsed_ms: 2400,
      honeypot: "",
    });

  assertBlockedByRls(anonymousCommentError, "anonymous visitor cannot create public comment");

  const { data: ownerPosts, error: ownerPostsError } = await supabase
    .from("owner_posts")
    .select("id,title,visibility")
    .eq("visibility", "public")
    .limit(1);

  assert(!ownerPostsError, "public owner updates are readable", ownerPostsError?.message);
  assert(Array.isArray(ownerPosts), "public owner updates query returns a list");

  const { error: blockedInsertError } = await supabase
    .from("portfolio_items")
    .insert({
      project_id: "system-planner",
      title: "anonymous insert should fail",
      kind: "pdf",
      summary: "RLS smoke test",
      tags: [],
      public_url: "/blocked.pdf",
      published: true,
    });

  assertBlockedByRls(blockedInsertError, "anonymous visitor cannot create portfolio item");

  const protectedInserts = [
    [
      "music_tracks",
      {
        title: "anonymous music should fail",
        artist: "RLS smoke test",
        mood: "blocked",
        audio_url: "https://example.com/blocked.mp3",
        published: true,
      },
      "anonymous visitor cannot create music track",
    ],
    [
      "gallery_items",
      {
        title: "anonymous image should fail",
        category: "概念",
        image_url: "https://example.com/blocked.png",
        published: true,
      },
      "anonymous visitor cannot create gallery item",
    ],
    [
      "reading_notes",
      {
        kind: "book",
        title: "anonymous note should fail",
        creator: "RLS smoke test",
        quote: "blocked",
        reflection: "blocked",
        tags: [],
        published: true,
      },
      "anonymous visitor cannot create reading note",
    ],
    [
      "site_settings",
      {
        id: "main",
        brand_name: "anonymous update should fail",
        background_music_enabled: true,
      },
      "anonymous visitor cannot update site settings",
    ],
  ];

  for (const [tableName, payload, label] of protectedInserts) {
    const { error } = await supabase.from(tableName).insert(payload);
    assertBlockedByRls(error, label);
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl("healthcheck.txt");
  assert(Boolean(publicUrlData.publicUrl), "public storage bucket URL can be generated");
}

if (failures.length > 0) {
  console.error(`\nSupabase backend verification failed with ${failures.length} issue(s).`);
  console.error("If the failures mention missing site_logo_url or internal portfolio items, run `supabase/fix-live-database.sql` in Supabase SQL Editor.");
  console.error("For broader database upgrades, run `npm run sql:supabase-upgrade` and paste the output into Supabase SQL Editor, then run supabase/set-owner.sql after your owner account exists.");
  process.exit(1);
}

console.log("\nSupabase backend verification passed.");
