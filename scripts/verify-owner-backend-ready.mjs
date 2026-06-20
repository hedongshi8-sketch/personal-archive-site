import { createVerificationClient } from "./create-verification-client.mjs";

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

function isNetworkError(error) {
  return /fetch failed|failed to fetch|networkerror/i.test(error?.message ?? "");
}

async function fetchText(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      }
    }
  }

  throw lastError;
}

async function checkRemoteBundle() {
  let html = "";
  try {
    html = await fetchText(remoteUrl);
  } catch (error) {
    fail("remote site is reachable for owner backend check", error instanceof Error ? error.message : String(error));
    return;
  }

  const scriptPath = html.match(/assets\/[^"']+\.js/)?.[0];

  assert(Boolean(scriptPath), "remote app bundle script is discoverable");
  if (!scriptPath) {
    return;
  }

  let bundle = "";
  try {
    bundle = await fetchText(new URL(scriptPath, remoteUrl).toString());
  } catch (error) {
    fail("remote app bundle is reachable for owner backend check", error instanceof Error ? error.message : String(error));
    return;
  }
  const hasRemoteSupabaseUrl = /https:\/\/[^"']*supabase\.co/.test(bundle);
  assert(hasRemoteSupabaseUrl, "remote bundle includes Supabase project URL");

  if (!hasRemoteSupabaseUrl) {
    fail(
      "remote owner backend is active",
      "GitHub Pages was built without VITE_SUPABASE_URL, so owner uploads cannot persist online yet",
    );
    return;
  }

  for (const token of [
    "signInWithPassword",
    "signUpWithPassword",
    "resetPasswordForEmail",
    "update_own_profile",
    "portfolio_items",
    "music_tracks",
    "gallery_items",
    "reading_notes",
    "site_settings",
    "owner_posts",
    "deleteComment",
    "client_elapsed_ms",
    "brand_name",
    "hero_title",
  ]) {
    assert(bundle.includes(token), `remote bundle includes ${token} integration`);
  }
}

async function expectAnonymousInsertBlocked(client, tableName, payload, label) {
  const { error } = await client.from(tableName).insert(payload);
  assert(Boolean(error) && !isNetworkError(error), label, error?.message);
}

async function checkSupabaseBackend() {
  if (!supabaseUrl || !supabaseAnonKey) {
    fail(
      "Supabase environment configured for owner backend",
      "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before owner uploads can persist online",
    );
    return;
  }

  const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);
  const publicTables = [
    ["portfolio_items", "id"],
    ["music_tracks", "id"],
    ["gallery_items", "id"],
    ["reading_notes", "id"],
    [
      "site_settings",
      "id,brand_name,brand_subtitle,hero_title,hero_description,site_avatar_url,hero_cover_url,background_music_url,background_music_title,background_music_enabled",
    ],
    ["owner_posts", "id,title,visibility"],
  ];

  for (const [tableName, columns] of publicTables) {
    const { error } = await supabase.from(tableName).select(columns).limit(1);
    assert(!error, `${tableName} is readable with anon key`, error?.message);
  }

  const { error: publicOwnerPostsError } = await supabase
    .from("owner_posts")
    .select("id,title,visibility")
    .eq("visibility", "public")
    .limit(1);
  assert(!publicOwnerPostsError, "public owner updates use public visibility", publicOwnerPostsError?.message);

  await expectAnonymousInsertBlocked(
    supabase,
    "public_comments",
    {
      author: "anonymous visitor",
      body: "this comment should be blocked because comments require auth",
      client_elapsed_ms: 2400,
      honeypot: "",
    },
    "anonymous visitor cannot create public comment",
  );

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

  const { data: commentRows, error: commentReadError } = await supabase
    .from("public_comments")
    .select("id")
    .eq("approved", true)
    .limit(1);
  assert(!commentReadError, "public comments are readable for moderation checks", commentReadError?.message);

  const publicCommentId = commentRows?.[0]?.id;
  if (publicCommentId) {
    const { error: deleteCommentError } = await supabase.from("public_comments").delete().eq("id", publicCommentId);
    assert(!isNetworkError(deleteCommentError), "anonymous public comment delete request reached Supabase", deleteCommentError?.message);

    const { data: preservedComment, error: preservedCommentError } = await supabase
      .from("public_comments")
      .select("id")
      .eq("id", publicCommentId)
      .maybeSingle();
    assert(!preservedCommentError, "public comment can be re-read after anonymous delete attempt", preservedCommentError?.message);
    assert(Boolean(preservedComment), "anonymous visitor cannot delete public comment");
  } else {
    pass("anonymous visitor cannot delete public comment skipped because there are no approved comments yet");
  }

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
  console.error("If the database checks fail, run supabase/migrations/20260619_account_editing.sql in the Supabase SQL Editor, then run supabase/set-owner.sql after your owner account exists.");
  process.exit(1);
}

console.log("\nOwner backend readiness passed.");
