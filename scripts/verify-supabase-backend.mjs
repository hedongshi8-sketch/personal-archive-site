import { createClient } from "@supabase/supabase-js";

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
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: projects, error: projectsError } = await supabase
    .from("portfolio_projects")
    .select("id,title")
    .order("sort_order", { ascending: true });

  assert(!projectsError, "public portfolio projects are readable", projectsError?.message);
  assert((projects?.length ?? 0) === 3, "portfolio project count is 3", `${projects?.length ?? 0}`);

  const { data: items, error: itemsError } = await supabase
    .from("portfolio_items")
    .select("id,title,project_id,kind,public_url")
    .eq("published", true);

  assert(!itemsError, "published portfolio items are readable", itemsError?.message);
  assert((items?.length ?? 0) === 16, "published portfolio item count is 16", `${items?.length ?? 0}`);

  const commentBody = `Supabase smoke test ${new Date().toISOString()}`;
  const { data: comment, error: commentError } = await supabase
    .from("public_comments")
    .insert({
      author: "验收访客",
      body: commentBody,
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

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl("healthcheck.txt");
  assert(Boolean(publicUrlData.publicUrl), "public storage bucket URL can be generated");
}

if (failures.length > 0) {
  console.error(`\nSupabase backend verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nSupabase backend verification passed.");
