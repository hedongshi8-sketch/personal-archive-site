import { execFileSync } from "node:child_process";

const remoteUrl = process.env.SITE_URL || "https://hedongshi8-sketch.github.io/personal-archive-site/";
const checks = [
  { path: "", type: "text/html", minBytes: 500 },
  { path: "404.html", type: "text/html", minBytes: 500 },
  { path: ".nojekyll", minBytes: 0 },
  { path: "portfolio-assets/game-town/prototype/index.html", type: "text/html", minBytes: 1_000 },
  {
    path: "portfolio-assets/barbarq/sheets/野蛮人大作战2-菇霸争夺战.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    minBytes: 1_000,
  },
  {
    path: "portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf",
    type: "application/pdf",
    minBytes: 1_000,
  },
];
const failures = [];

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail = "") {
  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function command(args) {
  return execFileSync(args[0], args.slice(1), {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        headers: {
          "user-agent": "personal-archive-site-verifier",
        },
      });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(1_500);
      }
    }
  }

  throw lastError;
}

try {
  const localHead = command(["git", "rev-parse", "HEAD"]);
  const remoteHead = command(["git", "rev-parse", "origin/main"]);

  if (localHead === remoteHead) {
    pass(`origin/main matches HEAD ${localHead.slice(0, 7)}`);
  } else {
    fail("origin/main matches HEAD", `${remoteHead.slice(0, 7)} != ${localHead.slice(0, 7)}`);
  }
} catch (error) {
  fail("origin/main can be checked", error.message);
}

const baseUrl = normalizeBaseUrl(remoteUrl);
for (const check of checks) {
  const url = new URL(check.path, baseUrl);

  try {
    const response = await fetchWithRetry(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";

    if (response.status !== 200) {
      fail(url.href, `expected 200, got ${response.status}`);
      continue;
    }

    if (check.type && !contentType.includes(check.type)) {
      fail(url.href, `expected content-type ${check.type}, got ${contentType}`);
      continue;
    }

    if (buffer.byteLength < check.minBytes) {
      fail(url.href, `expected at least ${check.minBytes} bytes, got ${buffer.byteLength}`);
      continue;
    }

    pass(`${url.href} ${contentType || "no content-type"} ${buffer.byteLength} bytes`);
  } catch (error) {
    fail(url.href, error instanceof Error ? error.message : "unknown error");
  }
}

if (failures.length > 0) {
  console.error("\nRemote release verification failed.");
  console.error("If GitHub Pages still returns 404, open the repository Settings -> Pages and set Source to GitHub Actions.");
  process.exit(1);
}

console.log("\nRemote release verification passed.");
