import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const mode = process.argv.includes("--remote") ? "remote" : "dist";
const siteUrl = process.env.SITE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";
const expectedRepo = process.env.VITE_GITHUB_COMMENTS_REPO || "hedongshi8-sketch/personal-archive-site";
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

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function command(args) {
  return execFileSync(args[0], args.slice(1), {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

async function readRemoteBundleText() {
  const baseUrl = normalizeBaseUrl(siteUrl);
  const indexUrl = new URL("", baseUrl);
  const indexResponse = await fetch(indexUrl, {
    headers: { "user-agent": "personal-archive-site-comments-verifier" },
  });

  if (!indexResponse.ok) {
    throw new Error(`expected ${indexUrl.href} to return 200, got ${indexResponse.status}`);
  }

  const indexHtml = await indexResponse.text();
  const scriptMatch = indexHtml.match(/<script[^>]+src="([^"]+index-[^"]+\.js)"[^>]*>/);

  if (!scriptMatch?.[1]) {
    throw new Error("could not find built app script in remote index.html");
  }

  const bundleUrl = new URL(scriptMatch[1], baseUrl);
  const bundleResponse = await fetch(bundleUrl, {
    headers: { "user-agent": "personal-archive-site-comments-verifier" },
  });

  if (!bundleResponse.ok) {
    throw new Error(`expected ${bundleUrl.href} to return 200, got ${bundleResponse.status}`);
  }

  pass(`remote app bundle fetched ${bundleUrl.href}`);
  return bundleResponse.text();
}

function readDistBundleText() {
  const bundleFiles = walkFiles("dist/assets").filter((file) => /\/index-[^/]+\.js$/.test(file));

  if (bundleFiles.length !== 1) {
    throw new Error(`expected one built app bundle, found ${bundleFiles.length}`);
  }

  pass(`dist app bundle found ${bundleFiles[0]}`);
  return read(bundleFiles[0]);
}

try {
  const appSource = read("src/App.tsx");
  assert(appSource.includes("https://utteranc.es/client.js"), "comments bridge loads Utterances client");
  assert(appSource.includes("issue-term\", \"pathname\""), "comments bridge maps comments by pathname");
  assert(appSource.includes("site-comment"), "comments bridge labels GitHub issues");
  assert(appSource.includes(expectedRepo), "comments bridge default repo is documented in source");

  const envExample = read(".env.example");
  assert(envExample.includes("VITE_GITHUB_COMMENTS_REPO"), ".env.example documents comments repo");

  const bundleText = mode === "remote" ? await readRemoteBundleText() : readDistBundleText();
  assert(bundleText.includes("https://utteranc.es/client.js"), `${mode} bundle includes Utterances client`);
  assert(bundleText.includes(expectedRepo), `${mode} bundle includes comments repo ${expectedRepo}`);
  assert(bundleText.includes("GitHub Issues"), `${mode} bundle includes GitHub Issues copy`);

  if (mode === "remote") {
    const localHead = command(["git", "rev-parse", "HEAD"]);
    const remoteHead = command(["git", "rev-parse", "origin/main"]);
    assert(localHead === remoteHead, "origin/main matches HEAD for comments bridge", `${remoteHead.slice(0, 7)} != ${localHead.slice(0, 7)}`);
  }
} catch (error) {
  fail("comments bridge verification can run", error instanceof Error ? error.message : "unknown error");
}

if (failures.length > 0) {
  console.error(`\nComments bridge verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nComments bridge verification passed.");
