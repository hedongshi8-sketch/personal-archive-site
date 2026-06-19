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
  assert((items?.length ?? 0) === 19, "published portfolio item count is 19", `${items?.length ?? 0}`);
  assert(
    (items ?? []).some((item) => item.preview_url?.includes("/portfolio-previews/")),
    "published portfolio items include in-site preview URLs",
  );

  const { error: settingsError } = await supabase
    .from("site_settings")
    .select("id,hero_cover_url,background_music_url,background_music_enabled")
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

  const { error: fastCommentError } = await supabase
    .from("public_comments")
    .insert({
      author: "验收访客",
      body: "this comment should be blocked by verification",
      client_elapsed_ms: 0,
      honeypot: "",
    });

  assert(Boolean(fastCommentError), "anonymous fast comment is blocked by verification policy");

  const commentBody = `Supabase smoke test ${new Date().toISOString()}`;
  const { data: comment, error: commentError } = await supabase
    .from("public_comments")
    .insert({
      author: "验收访客",
      body: commentBody,
      client_elapsed_ms: 2400,
      honeypot: "",
    })
    .select("id,author,body,likes")
    .single();

  assert(!commentError, "anonymous visitor can create public comment", commentError?.message);

  if (comment?.id) {
    const { error: likeError } = await supabase.rpc("increment_comment_likes", { comment_id: comment.id });
    assert(!likeError, "comment like RPC works", likeError?.message);
  }

  const { data: ownerPosts, error: ownerPostsError } = await supabase
    .from("owner_posts")
    .select("id")
    .limit(1);

  assert(!ownerPostsError, "anonymous owner_posts read is denied without error", ownerPostsError?.message);
  assert((ownerPosts?.length ?? 0) === 0, "anonymous visitor cannot read private posts", `${ownerPosts?.length ?? 0}`);

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

  assert(Boolean(blockedInsertError), "anonymous visitor cannot create portfolio item");

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
        background_music_enabled: true,
      },
      "anonymous visitor cannot update site settings",
    ],
  ];

  for (const [tableName, payload, label] of protectedInserts) {
    const { error } = await supabase.from(tableName).insert(payload);
    assert(Boolean(error), label);
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl("healthcheck.txt");
  assert(Boolean(publicUrlData.publicUrl), "public storage bucket URL can be generated");
}

if (failures.length > 0) {
  console.error(`\nSupabase backend verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nSupabase backend verification passed.");
