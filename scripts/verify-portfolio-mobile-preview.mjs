import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src", "App.tsx"), "utf8");
const dataSource = readFileSync(join(root, "src", "data", "portfolioItems.ts"), "utf8");
const backendSource = readFileSync(join(root, "src", "lib", "backendContract.ts"), "utf8");
const stylesSource = readFileSync(join(root, "src", "styles", "main.css"), "utf8");
const seedSource = readFileSync(join(root, "supabase", "seed-portfolio.sql"), "utf8");
const serviceWorkerSource = readFileSync(join(root, "public", "sw.js"), "utf8");
const headersSource = readFileSync(join(root, "public", "_headers"), "utf8");
const failures = [];

const pdfPreviewFiles = [
  "barbarq-main-design.json",
  "barbarq-art-requirement.json",
  "system-planner-portfolio.json",
  "ninja-rogue-system-portfolio.json",
];

const excelPreviewFiles = [
  "barbarq-main-sheet.json",
  "barbarq-art-sheet.json",
  "system-planner-war-sheet.json",
];

const workbookCollectionPreviewFiles = ["game-town-config-sheets.json"];

const simpleExcelPreviewFiles = ["ninja-rogue-config-workbook.json"];

const documentPreviewFiles = ["ninja-rogue-system-portfolio-docx.json"];

const markdownPreviewFiles = [
  "ninja-rogue-readme.json",
  "ninja-rogue-idea-pitch.json",
  "ninja-rogue-design-proposal.json",
  "ninja-rogue-prd.json",
  "ninja-rogue-art-request.json",
  "ninja-rogue-implementation-plan.json",
  "ninja-rogue-delivery-guide.json",
  "ninja-rogue-research-notes.json",
  "ninja-rogue-asset-sources.json",
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
  assert(Array.isArray(payload.pageImages) && payload.pageImages.length > 0, `${fileName} keeps visual page previews`);
  assert(existsSync(join(root, "public", payload.pageImages[0].src)), `${fileName} first page image asset exists`);
}

for (const fileName of excelPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `Excel JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "excel", `${fileName} renders through ExcelSheetPreview`, `kind=${payload.kind}`);
  assert(Array.isArray(payload.sheets) && payload.sheets.length > 0, `${fileName} has sheet previews`);
  const image = payload.sheets.flatMap((sheet) => sheet.images ?? [])[0];
  assert(Boolean(image?.src), `${fileName} keeps embedded image metadata`);
  if (image?.src) {
    assert(existsSync(join(root, "public", image.src)), `${fileName} embedded image asset exists`);
  }
}

for (const fileName of workbookCollectionPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `Excel collection JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "excel", `${fileName} renders through ExcelSheetPreview`, `kind=${payload.kind}`);
  assert(Array.isArray(payload.sheets) && payload.sheets.length >= 12, `${fileName} keeps the game town related table collection`);
  assert(Array.isArray(payload.sourceFiles) && payload.sourceFiles.length >= 12, `${fileName} keeps every related workbook download entry`);
}

for (const fileName of simpleExcelPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `Excel JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "excel", `${fileName} renders through ExcelSheetPreview`, `kind=${payload.kind}`);
  assert(Array.isArray(payload.sheets) && payload.sheets.length >= 8, `${fileName} keeps the Ninja Rogue workbook sheets`);
  assert(Array.isArray(payload.sourceFiles) && payload.sourceFiles[0]?.includes("NinjaRogue_ConfigWorkbook.xlsx"), `${fileName} points to the Ninja Rogue workbook`);
}

for (const fileName of documentPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `DOCX JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "document", `${fileName} renders through DocumentReader`, `kind=${payload.kind}`);
  assert(Array.isArray(payload.blocks) && payload.blocks.length > 8, `${fileName} has readable extracted blocks`);
}

for (const fileName of markdownPreviewFiles) {
  const filePath = join(root, "public", "portfolio-previews", fileName);
  assert(existsSync(filePath), `Markdown JSON preview exists: ${fileName}`);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  assert(payload.kind === "markdown", `${fileName} renders through RawTextPortfolioPreview`, `kind=${payload.kind}`);
  assert(typeof payload.content === "string" && payload.content.length > 500, `${fileName} has readable markdown content`);
}

includes(dataSource, "normalizePortfolioPreviewUrl", "portfolio data normalizes old PDF preview URLs");
includes(dataSource, "ensureRequiredPortfolioItems", "portfolio data merges required showcase items");
includes(dataSource, "game-town-config-sheets", "game town config sheets stay in the portfolio data");
includes(dataSource, "E:\\\\游戏小镇\\\\相关表格", "game town related sheets source path stays visible");
includes(dataSource, '"ninja-rogue"', "Ninja Rogue project is available in portfolio folders");
includes(dataSource, "ninja-rogue-system-portfolio", "Ninja Rogue system portfolio stays in the portfolio data");
includes(dataSource, "ninja-rogue-unity-demo", "Ninja Rogue Unity demo download stays in the portfolio data");
includes(dataSource, "NinjaRogueModePrototype_UnityProject.zip", "Ninja Rogue demo is published as a downloadable archive");
includes(dataSource, "hiddenPortfolioIds", "portfolio data hides weak public entries defensively");
includes(dataSource, "0147fb6e-5635-1e38-8923-654b00d21cd9", "BarbarQ related sheet is denylisted");
includes(dataSource, "8524dbae-2398-ff06-801c-93bb4ff0c50e", "game town visual concept is denylisted");
assert(!/id:\s*"barbarq-related-sheet"/.test(dataSource), "BarbarQ related sheet removed from static portfolio list");
assert(!/id:\s*"game-town-visual-concept"/.test(dataSource), "game town visual concept removed from static portfolio list");
assert(
  dataSource.indexOf("[\"game-town-config-sheets\"") > dataSource.indexOf("[\"game-town-prototype\"") &&
    dataSource.indexOf("[\"game-town-config-sheets\"") < dataSource.indexOf("[\"game-town-design-doc\""),
  "game town config sheets are prioritized near the top",
);
includes(dataSource, "barbarq-main-design.json", "main BarbarQ PDF uses JSON preview");
includes(dataSource, "barbarq-art-requirement.json", "art requirement PDF uses JSON preview");
includes(dataSource, "system-planner-portfolio.json", "system planner PDF uses JSON preview");
assert(!dataSource.includes("previewUrl: `${assetRoot}/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf`"), "main PDF no longer previews raw PDF");
assert(!dataSource.includes("previewUrl: `${assetRoot}/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf`"), "system planner PDF no longer previews raw PDF");

includes(backendSource, "normalizePortfolioPreviewUrl(item)", "Supabase portfolio rows normalize old preview URLs");
includes(backendSource, "ensureRequiredPortfolioItems", "Supabase portfolio rows merge required showcase items");
includes(appSource, "function isInlinePreview", "inline preview predicate exists");
includes(appSource, "function RawFilePortfolioPreview", "raw file preview fallback exists");
includes(appSource, "getOfficeViewerUrl", "Office files can use in-site Office viewer");
includes(appSource, "RawTextPortfolioPreview", "Markdown/text uploads can preview in-site");
includes(appSource, "inferPortfolioKindFromFile", "portfolio uploads infer kind from selected file format");
includes(appSource, "portfolioUploadAccept", "portfolio upload picker declares accepted portfolio formats");
includes(appSource, "portfolioInlineUploadKinds.has(detectedKind)", "portfolio upload preview behavior follows detected file format");
includes(appSource, "portfolioKindFilterOptions", "portfolio filters focus on file kinds after folder grouping");
includes(appSource, "projectFolders", "portfolio items are grouped into project folders");
includes(appSource, "portfolio-folder-tree", "portfolio folder tree is rendered");
includes(appSource, "portfolio-detail-path", "portfolio detail renders a folder-style path");
includes(appSource, "portfolio-empty-list", "portfolio folder browser has an empty-result state");
includes(appSource, "portfolio-detail-empty", "portfolio detail matches empty folder state");
includes(appSource, "function focusPortfolioPreview", "portfolio preview focus helper exists");
includes(appSource, "function selectPortfolioItem", "portfolio card selection helper exists");
includes(appSource, "window.matchMedia(\"(max-width: 860px)\")", "mobile card selection scrolls to preview");
includes(appSource, "查看站内预览", "preview action stays in the site");
includes(appSource, "放大预览", "desktop portfolio preview has an expanded reading action");
includes(appSource, "portfolio-expanded-preview", "expanded portfolio preview dialog is wired");
includes(appSource, "表内图片", "Excel reader renders embedded images");
includes(appSource, "版面预览", "document reader renders visual page previews");
includes(appSource, "has-page-images", "document reader marks visual-page documents for mobile layout");
includes(appSource, "getVersionedPreviewUrl", "JSON previews bypass stale browser caches");
includes(appSource, "recoverDocumentPageImages", "PDF document previews recover visual page images if cached JSON is stale");
assert(!appSource.includes("打开预览"), "raw preview action label is removed");
assert(!appSource.includes("href={activeItem.previewUrl} target=\"_blank\""), "preview action no longer opens raw files");

includes(stylesSource, ".portfolio-preview:focus", "portfolio preview has focus affordance");
includes(stylesSource, ".portfolio-browser", "portfolio browser hosts folder tree and file list");
includes(stylesSource, ".portfolio-folder-tree", "portfolio folder tree has layout styles");
includes(stylesSource, ".portfolio-file-panel", "portfolio file panel has layout styles");
includes(stylesSource, ".portfolio-empty-list", "portfolio empty list has layout styles");
includes(stylesSource, ".portfolio-empty-preview", "portfolio empty detail preview has layout styles");
includes(stylesSource, ".portfolio-detail-head .portfolio-detail-path", "portfolio detail path avoids title-scale text");
includes(stylesSource, "grid-auto-columns: minmax(190px, 72vw)", "mobile portfolio folders scroll horizontally");
includes(stylesSource, "scroll-margin-top: 72px", "portfolio preview has mobile scroll margin");
includes(stylesSource, "height: min(68svh, 760px)", "desktop portfolio preview has a tall default reading area");
assert(/\.portfolio-preview\s*{[^}]*height:\s*auto;[^}]*overflow:\s*visible;/s.test(stylesSource), "mobile portfolio preview expands instead of clipping long document images");
includes(stylesSource, ".portfolio-preview iframe,\n  .portfolio-preview > img", "mobile iframe and direct image previews keep a stable viewport height");
includes(stylesSource, ".portfolio-expanded-preview", "portfolio expanded preview overlay has styles");
includes(stylesSource, ".portfolio-expanded-body", "expanded preview body can host full readers");
includes(stylesSource, ".excel-image-board", "Excel embedded images have mobile styles");
includes(stylesSource, ".document-page-preview", "document page images have mobile styles");
includes(stylesSource, ".portfolio-preview .document-image-block img", "mobile DOCX embedded images override global preview image sizing");
includes(stylesSource, "max-height: none", "mobile DOCX embedded images are not vertically clipped");
includes(stylesSource, ".document-reader.has-page-images .document-page-strip", "mobile visual-page documents render page images as a vertical reading flow");
includes(stylesSource, ".document-reader.has-page-images .document-blocks", "mobile visual-page documents hide extracted text blocks");
includes(stylesSource, ".portfolio-detail-actions .cyan-button", "mobile preview actions stretch cleanly");

includes(serviceWorkerSource, "linx-archive-v5", "service worker cache version is bumped for portfolio preview fixes");
includes(serviceWorkerSource, "isPortfolioPreview", "service worker detects portfolio preview requests");
includes(headersSource, "/portfolio-previews/*", "portfolio preview headers are configured");
includes(headersSource, "Cache-Control: no-cache", "portfolio previews revalidate instead of staying stale");

for (const fileName of pdfPreviewFiles) {
  includes(seedSource, `/portfolio-previews/${fileName}`, `seed uses ${fileName}`);
}
includes(seedSource, "/portfolio-previews/game-town-config-sheets.json", "seed includes game town config sheet preview URL");
includes(seedSource, "'ninja-rogue', '忍三 Rogue 模式'", "seed includes Ninja Rogue project");
includes(seedSource, "/portfolio-previews/ninja-rogue-config-workbook.json", "seed includes Ninja Rogue workbook preview URL");
includes(seedSource, "/portfolio-assets/ninja-rogue/archive/NinjaRogueModePrototype_UnityProject.zip", "seed includes Ninja Rogue demo archive URL");
assert(
  seedSource.includes("'0147fb6e-5635-1e38-8923-654b00d21cd9', 'barbarq', '菇霸争夺战相关表格'") &&
    seedSource.includes("'0147fb6e-5635-1e38-8923-654b00d21cd9', 'barbarq', '菇霸争夺战相关表格'") &&
    seedSource.includes("false, false, 12"),
  "seed hides BarbarQ related sheet",
);
assert(
  seedSource.includes("'8524dbae-2398-ff06-801c-93bb4ff0c50e', 'game-town', '游戏小镇视觉概念图'") &&
    seedSource.includes("false, false, 27"),
  "seed hides game town visual concept",
);
assert(!seedSource.includes("'/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf', '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf'"), "seed no longer stores raw PDF as main PDF preview");
assert(!seedSource.includes("'/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf', '/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf'"), "seed no longer stores raw PDF as system planner preview");

if (failures.length > 0) {
  console.error(`\nPortfolio mobile preview verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nPortfolio mobile preview verification passed.");
