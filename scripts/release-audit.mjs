import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walkFiles(relativePath) {
  const start = path.join(root, relativePath);
  const files = [];

  if (!fs.existsSync(start)) {
    return files;
  }

  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    const fullPath = path.join(start, entry.name);
    const childRelativePath = path.relative(root, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      files.push(...walkFiles(childRelativePath));
    } else {
      files.push(childRelativePath);
    }
  }

  return files;
}

function sizeOf(relativePath) {
  return fs.statSync(path.join(root, relativePath)).size;
}

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

function command(args) {
  return execFileSync(args[0], args.slice(1), {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

assert(exists("package.json"), "package.json exists");
assert(exists("vercel.json"), "vercel.json exists");
assert(exists("public/_headers"), "Cloudflare _headers exists");
assert(exists("public/_redirects"), "Cloudflare _redirects exists");
assert(exists("public/.nojekyll"), "GitHub Pages .nojekyll exists");
assert(exists("public/404.html"), "GitHub Pages 404 fallback exists");
assert(exists(".github/workflows/ci.yml"), "CI workflow exists");
assert(exists(".github/workflows/vercel-deploy.yml"), "Vercel workflow exists");
assert(exists(".github/workflows/github-pages.yml"), "GitHub Pages workflow exists");
assert(exists("docs/deployment-runbook.md"), "deployment runbook exists");
assert(exists("docs/release-checklist.md"), "release checklist exists");
assert(exists("docs/development-maintenance.md"), "development maintenance docs exist");
assert(exists("docs/supabase-smtp.md"), "Supabase SMTP docs exist");
assert(exists(".env.example"), ".env.example exists");
assert(exists("supabase/fix-live-database.sql"), "Supabase live database fix script exists");
assert(exists("scripts/verify-live-database-fix.mjs"), "Supabase live database fix verifier exists");
assert(exists("supabase/schema.sql"), "Supabase schema exists");
assert(exists("supabase/seed-portfolio.sql"), "Supabase portfolio seed exists");
assert(exists("supabase/migrations/20260619_account_editing.sql"), "Supabase account editing migration exists");
assert(exists("supabase/migrations/20260620_hide_legacy_anonymous_comments.sql"), "Supabase legacy anonymous comments cleanup migration exists");
assert(exists("supabase/migrations/20260620_hide_internal_portfolio_items.sql"), "Supabase internal portfolio cleanup migration exists");
assert(exists("supabase/hide-internal-portfolio-items.sql"), "Supabase internal portfolio cleanup shortcut exists");
assert(exists("supabase/account-editing-check.sql"), "Supabase account editing check exists");
assert(exists("scripts/compose-supabase-upgrade-sql.mjs"), "Supabase upgrade SQL composer exists");
assert(read("README.md").includes("GitHub Pages"), "README documents GitHub Pages");
assert(read("docs/deployment-runbook.md").includes("GitHub Pages"), "runbook documents GitHub Pages");
assert(read("README.md").includes("docs/supabase-smtp.md"), "README links Supabase SMTP docs");
assert(read("docs/deployment-runbook.md").includes("Custom SMTP"), "runbook documents Custom SMTP");
assert(read("docs/release-checklist.md").includes("Custom SMTP"), "release checklist includes Custom SMTP");
assert(read("docs/supabase-smtp.md").includes("Gmail App Password"), "SMTP docs include Gmail free setup");
assert(read("docs/supabase-smtp.md").includes("从买域名到正式 SMTP 配完"), "SMTP docs include domain purchase flow");
assert(read("docs/supabase-smtp.md").includes("verify:auth-email"), "SMTP docs include Supabase auth email verification");
assert(read("docs/supabase-smtp.md").includes("verify:mail-dns"), "SMTP docs include mail DNS verification");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts?.["smoke:dist"] === "node scripts/dist-smoke-test.mjs", "dist smoke script exists");
assert(packageJson.scripts?.["deploy:readiness"] === "node scripts/deploy-readiness.mjs", "deploy readiness script exists");
assert(packageJson.scripts?.["pack:static"] === "node scripts/pack-static-release.mjs", "static pack script exists");
assert(packageJson.scripts?.["verify:remote"] === "node scripts/verify-remote-release.mjs", "remote verification script exists");
assert(packageJson.scripts?.["verify:comments"] === "node scripts/verify-comments-bridge.mjs", "comments bridge verification script exists");
assert(
  packageJson.scripts?.["verify:comments:remote"] === "node scripts/verify-comments-bridge.mjs --remote",
  "remote comments bridge verification script exists",
);
assert(packageJson.scripts?.["verify:supabase"] === "node scripts/verify-supabase-backend.mjs", "Supabase verification script exists");
assert(
  packageJson.scripts?.["verify:owner-backend"] === "node scripts/verify-owner-backend-ready.mjs",
  "owner backend verification script exists",
);
assert(
  packageJson.scripts?.["verify:owner-backend:remote"] === "node scripts/verify-owner-backend-ready.mjs --remote",
  "remote owner backend verification script exists",
);
assert(
  packageJson.scripts?.["verify:live-db-fix"] === "node scripts/verify-live-database-fix.mjs",
  "live database fix verification script exists",
);
assert(read("scripts/verify-owner-backend-ready.mjs").includes("anonymous visitor cannot delete public comment"), "owner backend verifier checks anonymous comment deletion");
assert(read("scripts/verify-owner-backend-ready.mjs").includes("approved public comments are tied to a profile"), "owner backend verifier checks legacy anonymous comments");
assert(packageJson.scripts?.["verify:smtp"] === "node scripts/verify-smtp.mjs", "SMTP verification script exists");
assert(packageJson.scripts?.["verify:email"] === "node scripts/verify-email-stack.mjs", "email stack verification script exists");
assert(read("scripts/verify-email-stack.mjs").includes("EMAIL_STACK_SEND_GMAIL"), "email stack verification supports gated real email send");
assert(packageJson.scripts?.["verify:email:final"] === "node scripts/verify-email-final.mjs", "final email verification script exists");
assert(read("scripts/verify-email-final.mjs").includes("EMAIL_STACK_TRIGGER_PASSWORD_RESET"), "final email verification triggers password reset email");
assert(packageJson.scripts?.["verify:email:guided"] === "node scripts/verify-email-guided.mjs", "guided email verification script exists");
assert(read("scripts/verify-email-guided.mjs").includes("askHidden") && read("scripts/verify-email-guided.mjs").includes("GMAIL_APP_PASSWORD"), "guided email verification reads app password interactively");
assert(packageJson.scripts?.["verify:gmail-smtp"] === "node scripts/verify-gmail-smtp.mjs", "Gmail SMTP verification script exists");
assert(read("scripts/verify-gmail-smtp.mjs").includes("load-local-env.mjs"), "Gmail SMTP verification loads local env");
assert(
  packageJson.scripts?.["supabase:configure-gmail-smtp"] === "node scripts/configure-supabase-gmail-smtp.mjs",
  "Supabase Gmail SMTP configuration script exists",
);
assert(
  packageJson.scripts?.["verify:auth-email"] === "node scripts/verify-supabase-auth-email.mjs",
  "Supabase auth email verification script exists",
);
assert(read("scripts/verify-supabase-auth-email.mjs").includes("load-local-env.mjs"), "Supabase auth email verification loads local env");
assert(
  packageJson.scripts?.["verify:password-reset-email"] === "node scripts/verify-password-reset-email.mjs",
  "Supabase password reset email verification script exists",
);
assert(read("scripts/verify-password-reset-email.mjs").includes("resetPasswordForEmail"), "password reset email verifier triggers Supabase reset email");
assert(read("scripts/verify-email-stack.mjs").includes("EMAIL_STACK_TRIGGER_PASSWORD_RESET"), "email stack verification supports password reset trigger");
assert(packageJson.scripts?.["verify:reading-import"] === "node scripts/verify-reading-import.mjs", "reading import verification script exists");
assert(read("scripts/verify-reading-import.mjs").includes("parseReadingClipboardText"), "reading import verifier checks clipboard parsing");
assert(packageJson.scripts?.["verify:mail-dns"] === "node scripts/verify-mail-dns.mjs", "mail DNS verification script exists");
assert(
  packageJson.scripts?.["sql:supabase-upgrade"] === "node scripts/compose-supabase-upgrade-sql.mjs",
  "Supabase upgrade SQL composer script exists",
);
assert(
  read("scripts/compose-supabase-upgrade-sql.mjs").includes("20260620_hide_legacy_anonymous_comments.sql"),
  "Supabase upgrade SQL composer includes legacy anonymous cleanup",
);
assert(
  read("scripts/compose-supabase-upgrade-sql.mjs").includes("20260620_hide_internal_portfolio_items.sql"),
  "Supabase upgrade SQL composer includes internal portfolio cleanup",
);

const ciWorkflow = read(".github/workflows/ci.yml");
const vercelWorkflow = read(".github/workflows/vercel-deploy.yml");
const pagesWorkflow = read(".github/workflows/github-pages.yml");
assert(ciWorkflow.includes("npm run smoke:dist"), "CI runs dist smoke test");
assert(vercelWorkflow.includes("npm run smoke:dist"), "Vercel deploy runs dist smoke test");
assert(pagesWorkflow.includes("npm run smoke:dist"), "GitHub Pages deploy runs dist smoke test");
assert(ciWorkflow.includes("npm run verify:reading-import"), "CI verifies reading import parsing");
assert(vercelWorkflow.includes("npm run verify:reading-import"), "Vercel deploy verifies reading import parsing");
assert(pagesWorkflow.includes("npm run verify:reading-import"), "GitHub Pages deploy verifies reading import parsing");
assert(ciWorkflow.includes("npm run verify:comments"), "CI verifies comments bridge");
assert(vercelWorkflow.includes("npm run verify:comments"), "Vercel deploy verifies comments bridge");
assert(pagesWorkflow.includes("npm run verify:comments"), "GitHub Pages deploy verifies comments bridge");
assert(ciWorkflow.includes("npm run audit:release"), "CI runs release audit");
assert(vercelWorkflow.includes("npm run audit:release"), "Vercel deploy runs release audit");
assert(pagesWorkflow.includes("npm run audit:release"), "GitHub Pages deploy runs release audit");
assert(vercelWorkflow.includes("Check Vercel secrets"), "Vercel deploy checks secrets before deploy");
assert(
  vercelWorkflow.includes("if: steps.vercel-secrets.outputs.configured == 'true'"),
  "Vercel deploy skips when secrets are missing",
);
for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLIC_BUCKET"]) {
  assert(pagesWorkflow.includes(key), `GitHub Pages workflow passes ${key}`);
}
assert(pagesWorkflow.includes("VITE_GITHUB_COMMENTS_REPO"), "GitHub Pages workflow passes VITE_GITHUB_COMMENTS_REPO");
assert(vercelWorkflow.includes("VITE_GITHUB_COMMENTS_REPO"), "Vercel workflow passes VITE_GITHUB_COMMENTS_REPO");
assert(ciWorkflow.includes("npm run pack:static"), "CI packs static release");
assert(ciWorkflow.includes("actions/upload-artifact@v4"), "CI uploads static release artifact");
assert(pagesWorkflow.includes("actions/deploy-pages@v4"), "GitHub Pages deploy action exists");

const gitignore = read(".gitignore");
assert(gitignore.includes("node_modules/"), "node_modules ignored");
assert(gitignore.includes("dist/"), "dist ignored");
assert(gitignore.includes(".env"), ".env ignored");

const envExample = read(".env.example");
for (const key of [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_SUPABASE_PUBLIC_BUCKET",
  "VITE_GITHUB_COMMENTS_REPO",
]) {
  assert(envExample.includes(key), `.env.example documents ${key}`);
}

const publicAssets = walkFiles("public/portfolio-assets");
const distAssets = walkFiles("dist/portfolio-assets");
const publicPreviews = walkFiles("public/portfolio-previews");
const distPreviews = walkFiles("dist/portfolio-previews");
const publicSize = publicAssets.reduce((sum, file) => sum + sizeOf(file), 0);
const distSize = distAssets.reduce((sum, file) => sum + sizeOf(file), 0);
const publicPreviewSize = publicPreviews.reduce((sum, file) => sum + sizeOf(file), 0);
const distPreviewSize = distPreviews.reduce((sum, file) => sum + sizeOf(file), 0);

assert(publicAssets.length === 84, "public portfolio asset count is 84", `${publicAssets.length}`);
assert(distAssets.length === 84, "dist portfolio asset count is 84", `${distAssets.length}`);
assert(publicSize === distSize, "portfolio asset byte size matches", `${publicSize} vs ${distSize}`);
assert(publicPreviews.length === 8, "public portfolio preview count is 8", `${publicPreviews.length}`);
assert(distPreviews.length === 8, "dist portfolio preview count is 8", `${distPreviews.length}`);
assert(publicPreviewSize === distPreviewSize, "portfolio preview byte size matches", `${publicPreviewSize} vs ${distPreviewSize}`);
const textLikeExtensions = new Set([".html", ".json", ".md", ".txt"]);
const publicPortfolioText = [...publicAssets, ...publicPreviews]
  .map((file) => `${file}\n${textLikeExtensions.has(path.extname(file).toLowerCase()) ? read(file) : ""}`)
  .join("\n");
for (const internalMarker of ["待替换个人信息", "投递说明_只看这个", "README_投递使用说明"]) {
  assert(!publicPortfolioText.includes(internalMarker), `public portfolio excludes internal marker ${internalMarker}`);
}

const seed = read("supabase/seed-portfolio.sql");
const seedItems = [...seed.matchAll(/'::timestamptz/g)].length;
assert(seedItems === 17, "portfolio seed item count is 17", `${seedItems}`);
assert(seed.includes("on conflict (id) do update set"), "portfolio seed is rerunnable");
assert(seed.includes("/portfolio-previews/barbarq-main-sheet.json"), "portfolio seed includes Excel preview URLs");
assert(seed.includes("/portfolio-previews/game-town-design-doc.json"), "portfolio seed includes document preview URLs");
for (const internalMarker of ["待替换个人信息", "系统策划投递说明", "投递说明_只看这个"]) {
  assert(!seed.includes(internalMarker), `portfolio seed excludes internal marker ${internalMarker}`);
}

const schema = read("supabase/schema.sql");
assert(schema.includes("create policy \"owner can manage portfolio items\""), "owner portfolio RLS exists");
assert(schema.includes("create policy \"owner can upload portfolio storage\""), "owner storage upload RLS exists");
assert(schema.includes("create or replace function public.increment_comment_likes"), "safe like RPC exists");
assert(schema.includes("create or replace function public.update_own_profile"), "profile update RPC exists");
for (const table of ["profiles", "owner_posts", "public_comments", "music_tracks", "gallery_items", "reading_notes", "site_settings"]) {
  assert(schema.includes(`create table public.${table}`), `Supabase ${table} table exists`);
}
for (const policy of [
  "signed in users can create comments",
  "owner can manage public updates",
  "published owner posts are public",
  "owner can delete comments",
  "owner can manage music tracks",
  "owner can manage gallery items",
  "owner can manage reading notes",
  "owner can manage site settings",
  "published music tracks are public",
  "published gallery items are public",
  "published reading notes are public",
]) {
  assert(schema.includes(`create policy "${policy}"`), `${policy} RLS exists`);
}
assert(schema.includes("client_elapsed_ms >= 2000"), "comment verification delay policy exists");
assert(schema.includes("honeypot = ''"), "comment honeypot policy exists");
assert(schema.includes("brand_name"), "site settings include editable brand name");
assert(schema.includes("hero_title"), "site settings include editable hero title");
assert(schema.includes("site_logo_url"), "site settings include editable site logo");
assert(schema.includes("'site-logo'"), "site logo upload asset kind exists");
assert(schema.includes("profile-avatars/"), "profile avatar storage path is allowed for signed-in users");
assert(schema.includes("author_id"), "comments are tied to profile author id");

const appSource = read("src/App.tsx");
const backendSource = read("src/lib/backendContract.ts");
assert(appSource.includes("https://utteranc.es/client.js"), "GitHub Issues comments bridge exists");
assert(appSource.includes("site-comment"), "GitHub Issues comments are labeled");
assert(appSource.includes("function useAuthSession"), "global auth session hook exists");
assert(appSource.includes("signInWithPassword"), "password sign-in is wired");
assert(appSource.includes("signUpWithPassword"), "password sign-up is wired");
assert(appSource.includes("sendPasswordReset") && appSource.includes("忘记密码"), "password reset email is wired");
assert(appSource.includes("passwordRecoveryReady") && appSource.includes("保存新密码"), "password recovery update UI is wired");
assert(backendSource.includes("updatePassword(password") && backendSource.includes("auth.updateUser({ password })"), "password recovery backend update is wired");
assert(appSource.includes("function AccountPanel"), "account panel exists");
assert(appSource.includes("function AccountDock") && appSource.includes("account-trigger"), "compact account dock exists");
assert(appSource.includes("account-mail-radar") && appSource.includes("邮件登录链路状态"), "account email status radar exists");
assert(appSource.includes("function EditableText"), "graphical editable text exists");
assert(appSource.includes("owner-brand-panel") && appSource.includes("页面编辑"), "owner edit mode exists");
assert(appSource.includes("brand-edit-panel") && appSource.includes("site-logo"), "site logo and brand editor exists");
assert(appSource.includes("owner-brand-status"), "owner brand status dashboard exists");
assert(appSource.includes("createGlobalSearchIndex") && appSource.includes("global-search-panel"), "global archive search is wired");
assert(appSource.includes("站主动态"), "public owner updates copy exists");
assert(appSource.includes("ExcelSheetPreview"), "Excel in-site preview reader exists");
assert(appSource.includes("DocumentReader"), "document in-site preview reader exists");
assert(appSource.includes("updatePortfolioItem") && appSource.includes("deletePortfolioItem"), "portfolio owner edit/delete UI exists");
assert(backendSource.includes("function assertPublicPortfolioInput") && backendSource.includes("已阻止公开发布"), "portfolio owner publish guard blocks internal files");
assert(appSource.includes("function MusicSection"), "music upload section exists");
assert(appSource.includes("function GallerySection"), "gallery upload section exists");
assert(appSource.includes("function NotesSection"), "reading notes section exists");
assert(appSource.includes("notes-search-box") && appSource.includes("note-reader-panel"), "reading notes search and reader panel exist");
assert(appSource.includes("parseReadingClipboardText") && appSource.includes("reading-import-guide"), "reading clipboard smart import exists");
assert(read("src/lib/readingImport.ts").includes("parseReadingClipboardText"), "reading clipboard parser module exists");
assert(appSource.includes("reading-workflow-rail") && appSource.includes("书摘发布流程"), "reading publish workflow rail exists");
assert(appSource.includes("reading-publication-board") && appSource.includes("copyReadingDraftPreview"), "reading public preview board exists");
assert(appSource.includes("updateMusicTrack") && appSource.includes("deleteMusicTrack"), "music owner edit/delete UI exists");
assert(appSource.includes("updateGalleryItem") && appSource.includes("deleteGalleryItem"), "gallery owner edit/delete UI exists");
assert(appSource.includes("updateOwnerPost") && appSource.includes("deleteOwnerPost"), "owner post edit/delete UI exists");
assert(appSource.includes("deleteComment") && appSource.includes("只有站主账号可以删除留言"), "comment owner delete UI exists");
assert(backendSource.includes('.not("author_id", "is", null)'), "public comments exclude legacy anonymous rows");
for (const localStore of [
  "localOwnerPosts",
  "localComments",
  "localPortfolioItems",
  "localMusicTracks",
  "localGalleryItems",
  "localReadingNotes",
]) {
  assert(backendSource.includes(`let ${localStore}`), `Local preview ${localStore} store exists`);
}
for (const localMutation of [
  "localOwnerPosts = [post, ...localOwnerPosts]",
  "localOwnerPosts = localOwnerPosts.map",
  "localOwnerPosts = localOwnerPosts.filter",
  "localComments = [comment, ...localComments]",
  "localComments = localComments.map",
  "localComments = localComments.filter",
  "localPortfolioItems = [item, ...localPortfolioItems]",
  "localPortfolioItems = localPortfolioItems.map",
  "localPortfolioItems = localPortfolioItems.filter",
  "localMusicTracks = [track, ...localMusicTracks]",
  "localMusicTracks = localMusicTracks.map",
  "localMusicTracks = localMusicTracks.filter",
  "localGalleryItems = [item, ...localGalleryItems]",
  "localGalleryItems = localGalleryItems.map",
  "localGalleryItems = localGalleryItems.filter",
  "localReadingNotes = [note, ...localReadingNotes]",
  "localReadingNotes = localReadingNotes.map",
  "localReadingNotes = localReadingNotes.filter",
]) {
  assert(backendSource.includes(localMutation), `Local preview mutation exists: ${localMutation}`);
}
for (const emptyLocalMethod of [
  /async deleteOwnerPost\([^)]*\)\s*{\s*return;\s*}/,
  /async likeComment\([^)]*\)\s*{\s*return;\s*}/,
  /async deleteComment\([^)]*\)\s*{\s*return;\s*}/,
  /async deletePortfolioItem\([^)]*\)\s*{\s*return;\s*}/,
  /async deleteMusicTrack\([^)]*\)\s*{\s*return;\s*}/,
  /async deleteGalleryItem\([^)]*\)\s*{\s*return;\s*}/,
  /async deleteReadingNote\([^)]*\)\s*{\s*return;\s*}/,
]) {
  assert(!emptyLocalMethod.test(backendSource), `Local preview backend has no empty mutation method ${emptyLocalMethod}`);
}
assert(appSource.includes("checkHumanGate"), "anti-spam human gate exists");
assert(appSource.includes("BackgroundMusicDock"), "background music dock exists");
assert(appSource.includes("resumeOnInteraction") && appSource.includes("is-blocked"), "background music auto-play recovery UI exists");
assert(appSource.includes("music-background-toggle"), "music radar can toggle default background music");
assert(appSource.includes("music-background-console") && appSource.includes("右下角播放开关已启用"), "music default background dashboard exists");

try {
  const status = command(["git", "status", "--short"]);
  assert(status === "", "git working tree is clean after commit", status);
} catch (error) {
  fail("git status can run", error.message);
}

try {
  const branch = process.env.GITHUB_REF_NAME || command(["git", "rev-parse", "--abbrev-ref", "HEAD"]);
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    pass("git branch check skipped for pull request");
  } else {
    assert(branch === "main", "git branch is main", branch);
  }
} catch (error) {
  fail("git branch can be read", error.message);
}

try {
  const remote = command(["git", "remote", "-v"]);
  if (remote) {
    pass("git remote configured");
  } else {
    console.warn("WARN git remote is not configured; push/deploy still needs a GitHub remote.");
  }
} catch (error) {
  fail("git remote can be read", error.message);
}

const suspiciousPattern = /(SUPABASE_SERVICE_ROLE|VERCEL_TOKEN=|sb_secret|BEGIN PRIVATE KEY|password=)/;
for (const file of walkFiles(".")) {
  if (
    file.startsWith(".git/") ||
    file.startsWith("node_modules/") ||
    file.startsWith("dist/") ||
    file === "scripts/release-audit.mjs" ||
    /\.(png|jpe?g|pdf|xlsx|docx|rar)$/i.test(file)
  ) {
    continue;
  }

  const text = read(file);
  if (suspiciousPattern.test(text)) {
    fail("no obvious secret patterns", file);
    break;
  }
}

if (failures.length > 0) {
  console.error(`\nRelease audit failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nRelease audit passed.");
