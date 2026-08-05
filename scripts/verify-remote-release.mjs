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
  {
    path: "portfolio-assets/game-town/docs/game-town-auto-behavior-offline-prd.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    minBytes: 100_000,
  },
  {
    path: "portfolio-assets/ninja-rogue/docs/NinjaRogue_SystemPortfolio.pdf",
    type: "application/pdf",
    minBytes: 10_000,
  },
  {
    path: "portfolio-assets/ninja-rogue/archive/NinjaRogueModePrototype_UnityProject.zip",
    minBytes: 1_000_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/docs/MyCultivationDaily_OpenWorldSystem_v5.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    minBytes: 40_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/docs/MyCultivationDaily_AdvancedVerticalSliceSpec_v6.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    minBytes: 40_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/sheets/ReferenceMatrix.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    minBytes: 5_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/sheets/AdvancedVerticalSliceTestCases.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    minBytes: 5_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/images/Demo_Default.png",
    type: "image/png",
    minBytes: 20_000,
  },
  {
    path: "portfolio-assets/my-cultivation-daily/archive/MyCultivationDaily_Godot2DVerticalSlice.zip",
    minBytes: 200_000,
  },
  {
    path: "portfolio-previews/barbarq-main-sheet.json",
    type: "application/json",
    minBytes: 1_000,
  },
  {
    path: "portfolio-previews/game-town-config-sheets.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/game-town-design-doc.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/game-town-auto-behavior-prd.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/ninja-rogue-system-portfolio.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/ninja-rogue-config-workbook.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/my-cultivation-daily-open-world-system-v5.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/my-cultivation-daily-vertical-slice-spec-v6.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/my-cultivation-daily-reference-workbooks.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "portfolio-previews/my-cultivation-daily-test-cases.json",
    type: "application/json",
    minBytes: 1_000,
  },
];
const absentChecks = [
  "portfolio-assets/system-planner/docs/00_简历+作品集_系统策划实习生_最终合并版_待替换个人信息.pdf",
  "portfolio-assets/system-planner/notes/投递说明_只看这个.txt",
  "portfolio-assets/system-planner/notes/README_投递使用说明.md",
  "portfolio-previews/system-planner-submission-note.json",
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
const baseHost = new URL(baseUrl).hostname;
const activeChecks =
  baseHost === "easttiger.top"
    ? [
        ...checks,
        {
          path: "CNAME",
          minBytes: 10,
        },
        {
          path: "personal-archive-site/",
          type: "text/html",
          minBytes: 300,
        },
      ]
    : checks;

for (const check of activeChecks) {
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

for (const path of absentChecks) {
  const url = new URL(path, baseUrl);

  try {
    const response = await fetchWithRetry(url);
    if (response.status === 404) {
      pass(`${url.href} is not published`);
    } else {
      fail(url.href, `expected 404 for internal file, got ${response.status}`);
    }
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
