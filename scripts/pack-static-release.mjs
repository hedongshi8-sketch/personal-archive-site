import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, "dist");
const releaseDir = path.join(root, "release");
const zipPath = path.join(releaseDir, "personal-archive-site-static.zip");
const manifestPath = path.join(releaseDir, "personal-archive-site-static-manifest.json");

function walkFiles(startDir) {
  const files = [];

  for (const entry of fs.readdirSync(startDir, { withFileTypes: true })) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function runPowerShell(command) {
  execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
    cwd: root,
    stdio: "inherit",
  });
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error("dist/index.html is missing. Run `npm run build` first.");
  process.exit(1);
}

fs.mkdirSync(releaseDir, { recursive: true });

if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

const files = walkFiles(distDir);
const totalBytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const manifest = {
  name: "personal-archive-site-static",
  createdAt: new Date().toISOString(),
  source: "dist",
  fileCount: files.length,
  totalBytes,
  entrypoints: [
    "index.html",
    "sw.js",
    "_headers",
    "_redirects",
    "portfolio-assets/game-town/prototype/index.html",
    "portfolio-assets/system-planner/prototypes/war-ui/index.html",
  ],
  files: files.map((file) => {
    const relativePath = path.relative(distDir, file).replace(/\\/g, "/");

    return {
      path: relativePath,
      bytes: fs.statSync(file).size,
    };
  }),
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const escapedDistDir = distDir.replace(/'/g, "''");
const escapedZipPath = zipPath.replace(/'/g, "''");
runPowerShell(
  `Get-ChildItem -LiteralPath '${escapedDistDir}' | Compress-Archive -DestinationPath '${escapedZipPath}' -Force`,
);

const zipBytes = fs.statSync(zipPath).size;
console.log(`Packed ${files.length} files (${totalBytes} bytes) into:`);
console.log(zipPath);
console.log(`Zip size: ${zipBytes} bytes`);
console.log(`Manifest: ${manifestPath}`);
