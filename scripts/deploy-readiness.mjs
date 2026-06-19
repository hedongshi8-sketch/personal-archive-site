import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import "./load-local-env.mjs";

const root = process.cwd();
const blockers = [];
const warnings = [];

function command(args) {
  try {
    return execFileSync(args[0], args.slice(1), {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function pass(label, detail = "") {
  console.log(`PASS ${label}${detail ? `: ${detail}` : ""}`);
}

function warn(label, detail = "") {
  warnings.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.warn(`WARN ${label}${detail ? `: ${detail}` : ""}`);
}

function block(label, detail = "") {
  blockers.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`BLOCK ${label}${detail ? `: ${detail}` : ""}`);
}

const remote = command(["git", "remote", "-v"]);
if (remote) {
  pass("git remote configured");
} else {
  block("git remote missing", "add a GitHub remote before push-based deployment");
}

const cliChecks = [
  ["gh", ["gh", "--version"]],
  ["vercel", ["vercel", "--version"]],
  ["wrangler", ["wrangler", "--version"]],
  ["netlify", ["netlify", "--version"]],
];

const availableCli = cliChecks
  .map(([name, args]) => [name, command(args)])
  .filter(([, output]) => output);

if (availableCli.length > 0) {
  for (const [name, output] of availableCli) {
    pass(`${name} CLI available`, output.split(/\r?\n/)[0]);
  }
} else {
  warn("deployment CLIs unavailable", "publish through provider web UI or install/auth a CLI");
}

if (!fs.existsSync(path.join(root, ".env")) && !fs.existsSync(path.join(root, ".env.local"))) {
  warn(".env missing", "local Supabase preview will stay in fallback mode");
} else {
  const requiredEnv = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_SUPABASE_PUBLIC_BUCKET",
  ];

  for (const key of requiredEnv) {
    if (process.env[key]) {
      pass(`${key} configured locally`);
    } else {
      warn(`${key} missing locally`);
    }
  }
}

if (fs.existsSync(path.join(root, "supabase", "schema.sql"))) {
  pass("Supabase schema file present");
} else {
  block("Supabase schema file missing");
}

if (fs.existsSync(path.join(root, "supabase", "seed-portfolio.sql"))) {
  pass("Supabase seed file present");
} else {
  block("Supabase seed file missing");
}

if (blockers.length > 0) {
  console.error("\nPublic deployment is not ready yet.");
  console.error("Next required action:");
  console.error("- Create/connect a GitHub repository, then run `git remote add origin <repo-url>` and push `main`.");
  console.error("- After pushing, GitHub Pages can publish the static site without Vercel secrets.");
  process.exit(1);
}

console.log("\nPublic deployment prerequisites are present.");
if (warnings.length > 0) {
  console.warn("Warnings remain; they may be fine for static preview but not for owner-only editing.");
}
