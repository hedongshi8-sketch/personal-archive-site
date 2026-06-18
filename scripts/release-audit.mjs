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
assert(exists(".env.example"), ".env.example exists");
assert(exists("supabase/schema.sql"), "Supabase schema exists");
assert(exists("supabase/seed-portfolio.sql"), "Supabase portfolio seed exists");
assert(read("README.md").includes("GitHub Pages"), "README documents GitHub Pages");
assert(read("docs/deployment-runbook.md").includes("GitHub Pages"), "runbook documents GitHub Pages");

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts?.["smoke:dist"] === "node scripts/dist-smoke-test.mjs", "dist smoke script exists");
assert(packageJson.scripts?.["deploy:readiness"] === "node scripts/deploy-readiness.mjs", "deploy readiness script exists");
assert(packageJson.scripts?.["pack:static"] === "node scripts/pack-static-release.mjs", "static pack script exists");
assert(packageJson.scripts?.["verify:remote"] === "node scripts/verify-remote-release.mjs", "remote verification script exists");
assert(packageJson.scripts?.["verify:supabase"] === "node scripts/verify-supabase-backend.mjs", "Supabase verification script exists");

const ciWorkflow = read(".github/workflows/ci.yml");
const vercelWorkflow = read(".github/workflows/vercel-deploy.yml");
const pagesWorkflow = read(".github/workflows/github-pages.yml");
assert(ciWorkflow.includes("npm run smoke:dist"), "CI runs dist smoke test");
assert(vercelWorkflow.includes("npm run smoke:dist"), "Vercel deploy runs dist smoke test");
assert(pagesWorkflow.includes("npm run smoke:dist"), "GitHub Pages deploy runs dist smoke test");
assert(ciWorkflow.includes("npm run audit:release"), "CI runs release audit");
assert(vercelWorkflow.includes("npm run audit:release"), "Vercel deploy runs release audit");
assert(pagesWorkflow.includes("npm run audit:release"), "GitHub Pages deploy runs release audit");
assert(vercelWorkflow.includes("Check Vercel secrets"), "Vercel deploy checks secrets before deploy");
assert(
  vercelWorkflow.includes("if: steps.vercel-secrets.outputs.configured == 'true'"),
  "Vercel deploy skips when secrets are missing",
);
assert(ciWorkflow.includes("npm run pack:static"), "CI packs static release");
assert(ciWorkflow.includes("actions/upload-artifact@v4"), "CI uploads static release artifact");
assert(pagesWorkflow.includes("actions/deploy-pages@v4"), "GitHub Pages deploy action exists");

const gitignore = read(".gitignore");
assert(gitignore.includes("node_modules/"), "node_modules ignored");
assert(gitignore.includes("dist/"), "dist ignored");
assert(gitignore.includes(".env"), ".env ignored");

const envExample = read(".env.example");
for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_PUBLIC_BUCKET"]) {
  assert(envExample.includes(key), `.env.example documents ${key}`);
}

const publicAssets = walkFiles("public/portfolio-assets");
const distAssets = walkFiles("dist/portfolio-assets");
const publicSize = publicAssets.reduce((sum, file) => sum + sizeOf(file), 0);
const distSize = distAssets.reduce((sum, file) => sum + sizeOf(file), 0);

assert(publicAssets.length === 87, "public portfolio asset count is 87", `${publicAssets.length}`);
assert(distAssets.length === 87, "dist portfolio asset count is 87", `${distAssets.length}`);
assert(publicSize === distSize, "portfolio asset byte size matches", `${publicSize} vs ${distSize}`);

const seed = read("supabase/seed-portfolio.sql");
const seedItems = [...seed.matchAll(/'::timestamptz/g)].length;
assert(seedItems === 16, "portfolio seed item count is 16", `${seedItems}`);
assert(seed.includes("on conflict (id) do update set"), "portfolio seed is rerunnable");

const schema = read("supabase/schema.sql");
assert(schema.includes("create policy \"owner can manage portfolio items\""), "owner portfolio RLS exists");
assert(schema.includes("create policy \"owner can upload portfolio storage\""), "owner storage upload RLS exists");
assert(schema.includes("create or replace function public.increment_comment_likes"), "safe like RPC exists");

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
