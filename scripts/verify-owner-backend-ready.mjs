import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = process.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";
const remoteMode = process.argv.includes("--remote");
const remoteUrl = process.env.SITE_REMOTE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";
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

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

async function checkRemoteBundle() {
  const html = await fetchText(remoteUrl);
  const scriptPath = html.match(/assets\/[^"']+\.js/)?.[0];

  assert(Boolean(scriptPath), "remote app bundle script is discoverable");
  if (!scriptPath) {
    return;
  }

  const bundle = await fetchText(new URL(scriptPath, remoteUrl).toString());
  assert(/https:\/\/[^"']*supabase\.co/.test(bundle), "remote bundle includes Supabase project URL");

  for (const token of [
    "portfolio_items",
    "music_tracks",
    "gallery_items",
    "reading_notes",
    "site_settings",
    "client_elapsed_ms",
  ]) {
    assert(bundle.includes(token), `remote bundle includes ${token} integration`);
  }
}

async function expectAnonymousInsertBlocked(client, tableName, payload, label) {
  const { error } = await client.from(tableName).insert(payload);
  assert(Boolean(error), label);
}

async function checkSupabaseBackend() {
  if (!supabaseUrl || !supabaseAnonKey) {
    fail(
      "Supabase environment configured for owner backend",
      "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before owner uploads can persist online",
    );
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const publicTables = [
    ["portfolio_items", "id"],
    ["music_tracks", "id"],
    ["gallery_items", "id"],
    ["reading_notes", "id"],
    ["site_settings", "id"],
  ];

  for (const [tableName, columns] of publicTables) {
    const { error } = await supabase.from(tableName).select(columns).limit(1);
    assert(!error, `${tableName} is readable with anon key`, error?.message);
  }

  await expectAnonymousInsertBlocked(
    supabase,
    "portfolio_items",
    {
      project_id: "system-planner",
      title: "anonymous portfolio insert should fail",
      kind: "pdf",
      summary: "owner backend readiness check",
      tags: [],
      public_url: "/blocked.pdf",
      published: true,
    },
    "anonymous visitor cannot create portfolio item",
  );

  await expectAnonymousInsertBlocked(
    supabase,
    "music_tracks",
    {
      title: "anonymous music insert should fail",
      artist: "owner backend readiness check",
      mood: "blocked",
      audio_url: "https://example.com/blocked.mp3",
      published: true,
    },
    "anonymous visitor cannot create music track",
  );

  await expectAnonymousInsertBlocked(
    supabase,
    "gallery_items",
    {
      title: "anonymous gallery insert should fail",
      category: "概念",
      image_url: "https://example.com/blocked.png",
      published: true,
    },
    "anonymous visitor cannot create gallery item",
  );

  await expectAnonymousInsertBlocked(
    supabase,
    "reading_notes",
    {
      kind: "book",
      title: "anonymous note insert should fail",
      creator: "owner backend readiness check",
      quote: "blocked",
      reflection: "blocked",
      tags: [],
      published: true,
    },
    "anonymous visitor cannot create reading note",
  );

  await expectAnonymousInsertBlocked(
    supabase,
    "site_settings",
    {
      id: "main",
      background_music_enabled: true,
    },
    "anonymous visitor cannot update site settings",
  );

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl("owner-backend-healthcheck.txt");
  assert(Boolean(publicUrlData.publicUrl), "public storage bucket URL can be generated");
}

if (remoteMode) {
  await checkRemoteBundle();
}

await checkSupabaseBackend();

if (failures.length > 0) {
  console.error(`\nOwner backend readiness failed with ${failures.length} issue(s).`);
  console.error("The public site can still work as a static portfolio, but owner uploads will not persist online yet.");
  process.exit(1);
}

console.log("\nOwner backend readiness passed.");
