import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src", "App.tsx"), "utf8");
const dataSource = readFileSync(join(root, "src", "data", "portfolioItems.ts"), "utf8");
const backendSource = readFileSync(join(root, "src", "lib", "backendContract.ts"), "utf8");
const stylesSource = readFileSync(join(root, "src", "styles", "main.css"), "utf8");
const seedSource = readFileSync(join(root, "supabase", "seed-portfolio.sql"), "utf8");
const failures = [];

const pdfPreviewFiles = [
  "barbarq-main-design.json",
  "barbarq-art-requirement.json",
  "system-planner-portfolio.json",
];

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

function includes(source, text, label) {
  assert(source.includes(text), label, `missing ${text}`);
}

for (const fileName of pdfPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `PDF JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "document", `${fileName} renders through DocumentReader`, `kind=${payload.kind}`);
  assert(Array.isArray(payload.blocks) && payload.blocks.length > 8, `${fileName} has readable extracted blocks`);
}

includes(dataSource, "normalizePortfolioPreviewUrl", "portfolio data normalizes old PDF preview URLs");
includes(dataSource, "barbarq-main-design.json", "main BarbarQ PDF uses JSON preview");
includes(dataSource, "barbarq-art-requirement.json", "art requirement PDF uses JSON preview");
includes(dataSource, "system-planner-portfolio.json", "system planner PDF uses JSON preview");
assert(!dataSource.includes("previewUrl: `${assetRoot}/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf`"), "main PDF no longer previews raw PDF");
assert(!dataSource.includes("previewUrl: `${assetRoot}/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf`"), "system planner PDF no longer previews raw PDF");

includes(backendSource, "normalizePortfolioPreviewUrl(item)", "Supabase portfolio rows normalize old preview URLs");
includes(appSource, "function isInlinePreview", "inline preview predicate exists");
includes(appSource, "function focusPortfolioPreview", "portfolio preview focus helper exists");
includes(appSource, "function selectPortfolioItem", "portfolio card selection helper exists");
includes(appSource, "window.matchMedia(\"(max-width: 860px)\")", "mobile card selection scrolls to preview");
includes(appSource, "查看站内预览", "preview action stays in the site");
assert(!appSource.includes("打开预览"), "raw preview action label is removed");
assert(!appSource.includes("href={activeItem.previewUrl} target=\"_blank\""), "preview action no longer opens raw files");
assert(!appSource.includes("item.kind === \"pdf\" || item.kind === \"html-prototype\""), "PDF is not embedded as raw iframe");

includes(stylesSource, ".portfolio-preview:focus", "portfolio preview has focus affordance");
includes(stylesSource, "scroll-margin-top: 72px", "portfolio preview has mobile scroll margin");
includes(stylesSource, ".portfolio-detail-actions .cyan-button", "mobile preview actions stretch cleanly");

for (const fileName of pdfPreviewFiles) {
  includes(seedSource, `/portfolio-previews/${fileName}`, `seed uses ${fileName}`);
}
assert(!seedSource.includes("'/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf', '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf'"), "seed no longer stores raw PDF as main PDF preview");
assert(!seedSource.includes("'/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf', '/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf'"), "seed no longer stores raw PDF as system planner preview");

if (failures.length > 0) {
  console.error(`\nPortfolio mobile preview verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nPortfolio mobile preview verification passed.");
