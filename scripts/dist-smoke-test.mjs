import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, "dist");
const failures = [];

const checks = [
  { path: "/", type: "text/html", minBytes: 500 },
  { path: "/404.html", type: "text/html", minBytes: 500 },
  { path: "/.nojekyll", type: "application/octet-stream", minBytes: 0 },
  { path: "/sw.js", type: "text/javascript", minBytes: 100 },
  { path: "/_headers", type: "text/plain", minBytes: 10 },
  { path: "/_redirects", type: "text/plain", minBytes: 10 },
  {
    path: "/portfolio-assets/game-town/prototype/index.html",
    type: "text/html",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-assets/game-town/prototype/app.js",
    type: "text/javascript",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-assets/system-planner/prototypes/war-ui/index.html",
    type: "text/html",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-assets/barbarq/sheets/野蛮人大作战2-菇霸争夺战.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf",
    type: "application/pdf",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-previews/barbarq-main-sheet.json",
    type: "application/json",
    minBytes: 1_000,
  },
  {
    path: "/portfolio-previews/game-town-config-sheets.json",
    type: "application/json",
    minBytes: 10_000,
  },
  {
    path: "/portfolio-previews/game-town-design-doc.json",
    type: "application/json",
    minBytes: 10_000,
  },
];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".rar", "application/vnd.rar"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [
    ".xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
]);

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail = "") {
  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

function contentTypeFor(filePath) {
  const fileName = path.basename(filePath);

  if (fileName === "_headers" || fileName === "_redirects") {
    return "text/plain; charset=utf-8";
  }

  return mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

function resolveDistPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split("?")[0] ?? "/");
  const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const relativePath = cleanPath.replace(/^\/+/, "");
  const resolvedPath = path.resolve(distDir, relativePath);
  const relativeToDist = path.relative(distDir, resolvedPath);

  if (relativeToDist.startsWith("..") || path.isAbsolute(relativeToDist)) {
    return null;
  }

  return resolvedPath;
}

function createStaticServer() {
  return createServer((request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const filePath = resolveDistPath(url.pathname);

      if (!filePath) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const stat = fs.statSync(filePath);
      response.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": contentTypeFor(filePath),
      });
      fs.createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : "Unknown error");
    }
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server.address());
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  fail("dist build exists", "run `npm run build` first");
} else {
  pass("dist build exists");
}

if (failures.length === 0) {
  const server = createStaticServer();
  const address = await listen(server);
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    for (const check of checks) {
      const response = await fetch(new URL(check.path, baseUrl));
      const buffer = Buffer.from(await response.arrayBuffer());
      const actualType = response.headers.get("content-type") ?? "";

      if (response.status !== 200) {
        fail(check.path, `expected 200, got ${response.status}`);
        continue;
      }

      if (!actualType.includes(check.type)) {
        fail(check.path, `expected content-type ${check.type}, got ${actualType}`);
        continue;
      }

      if (buffer.byteLength < check.minBytes) {
        fail(check.path, `expected at least ${check.minBytes} bytes, got ${buffer.byteLength}`);
        continue;
      }

      pass(`${check.path} ${actualType} ${buffer.byteLength} bytes`);
    }
  } finally {
    await close(server);
  }
}

if (failures.length > 0) {
  console.error(`\nDist smoke test failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nDist smoke test passed.");
