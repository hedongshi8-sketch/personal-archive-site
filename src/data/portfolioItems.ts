export type PortfolioProject = "all" | "barbarq" | "system-planner" | "game-town" | "ninja-rogue";

export type PortfolioKind =
  | "pdf"
  | "excel"
  | "docx"
  | "html-prototype"
  | "image"
  | "archive"
  | "markdown"
  | "text";

export type PortfolioItem = {
  id: string;
  title: string;
  project: Exclude<PortfolioProject, "all">;
  projectLabel: string;
  kind: PortfolioKind;
  kindLabel: string;
  summary: string;
  tags: string[];
  publicUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  sourcePath: string;
  updatedAt: string;
  featured?: boolean;
  downloadable?: boolean;
};

const internalPortfolioPattern = /待替换个人信息|投递说明_只看这个|README_投递使用说明|系统策划投递说明/;
const hiddenPortfolioIds = new Set([
  "barbarq-related-sheet",
  "game-town-visual-concept",
  "0147fb6e-5635-1e38-8923-654b00d21cd9",
  "8524dbae-2398-ff06-801c-93bb4ff0c50e",
]);
const hiddenPortfolioPattern = /菇霸争夺战相关表格|游戏小镇视觉概念图|barbarq-related-sheet|game-town-visual-concept/;

export function isPublicPortfolioItem(
  item: Pick<PortfolioItem, "title" | "publicUrl" | "previewUrl"> & { id?: string; sourcePath?: string },
) {
  const searchable = [item.id, item.title, item.publicUrl, item.previewUrl, item.sourcePath].filter(Boolean).join(" ");
  return !hiddenPortfolioIds.has(item.id ?? "") && !internalPortfolioPattern.test(searchable) && !hiddenPortfolioPattern.test(searchable);
}

const withBase = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const assetRoot = withBase("portfolio-assets");
const previewRoot = withBase("portfolio-previews");

const pdfPreviewOverrides = [
  {
    matchers: ["barbarq-main-design", "野蛮人大作战2-菇霸争夺战.pdf", "野蛮人大作战2 - 菇霸争夺战策划案"],
    previewUrl: `${previewRoot}/barbarq-main-design.json`,
  },
  {
    matchers: ["barbarq-art-requirement", "野蛮人大作战2-菇霸争夺战部分美术需求.pdf", "菇霸争夺战部分美术需求"],
    previewUrl: `${previewRoot}/barbarq-art-requirement.json`,
  },
  {
    matchers: ["system-planner-portfolio", "01_作品集_系统策划实习生_最终投递版.pdf", "系统策划实习生作品集"],
    previewUrl: `${previewRoot}/system-planner-portfolio.json`,
  },
];

export function normalizePortfolioPreviewUrl(item: Pick<PortfolioItem, "id" | "title" | "kind" | "publicUrl" | "previewUrl">) {
  if (!item.previewUrl) {
    return undefined;
  }

  if (item.previewUrl.endsWith(".json")) {
    return item.previewUrl;
  }

  if (item.kind !== "pdf") {
    return item.previewUrl;
  }

  const searchable = [item.id, item.title, item.publicUrl, item.previewUrl].join(" ");
  return pdfPreviewOverrides.find((override) => override.matchers.some((matcher) => searchable.includes(matcher)))?.previewUrl ?? item.previewUrl;
}

const preferredPortfolioOrder = [
  ["ninja-rogue-system-portfolio", "忍三 Rogue 模式系统作品集", "ninja-rogue-system-portfolio.json"],
  ["ninja-rogue-config-workbook", "忍三 Rogue 模式配置表", "ninja-rogue-config-workbook.json"],
  ["ninja-rogue-design-proposal", "忍三 Rogue 模式系统策划案", "ninja-rogue-design-proposal.json"],
  ["ninja-rogue-prd", "忍三 Rogue 模式 PRD", "ninja-rogue-prd.json"],
  ["ninja-rogue-unity-demo", "忍三 Rogue 模式 Unity 工程下载包"],
  ["ninja-rogue-demo-screenshot", "忍三 Rogue 模式 Demo 截图"],
  ["ninja-rogue-readme", "忍三 Rogue 模式项目说明", "ninja-rogue-readme.json"],
  ["ninja-rogue-idea-pitch", "忍三 Rogue 模式立项 Pitch", "ninja-rogue-idea-pitch.json"],
  ["ninja-rogue-art-request", "忍三 Rogue 模式美术需求文档", "ninja-rogue-art-request.json"],
  ["ninja-rogue-implementation-plan", "忍三 Rogue 模式开发计划", "ninja-rogue-implementation-plan.json"],
  ["ninja-rogue-delivery-guide", "忍三 Rogue 模式投递说明", "ninja-rogue-delivery-guide.json"],
  ["ninja-rogue-research-notes", "忍三 Rogue 模式竞品研究", "ninja-rogue-research-notes.json"],
  ["ninja-rogue-asset-sources", "忍三 Rogue 模式素材来源说明", "ninja-rogue-asset-sources.json"],
  ["ninja-rogue-system-portfolio-docx", "忍三 Rogue 模式作品集源文件", "ninja-rogue-system-portfolio-docx.json"],
  ["system-planner-portfolio", "系统策划实习生作品集", "system-planner-portfolio.json"],
  ["game-town-prototype", "游戏小镇微信小程序交互原型", "/game-town/prototype/index.html"],
  ["game-town-config-sheets", "游戏小镇系统配置表合集", "game-town-config-sheets.json", "E:\\游戏小镇\\相关表格"],
  ["game-town-design-doc", "游戏小镇方案完善版", "game-town-design-doc.json"],
  ["system-planner-war-sheet", "战意 / 骑砍2 / 全面战争系统拆解案", "system-planner-war-sheet.json"],
  ["system-planner-war-prototype", "3D战争界面 HTML 交互原型", "/system-planner/prototypes/war-ui/index.html"],
  ["barbarq-main-design", "野蛮人大作战2 - 菇霸争夺战策划案", "barbarq-main-design.json"],
  ["barbarq-main-sheet", "菇霸争夺战配置表", "barbarq-main-sheet.json"],
  ["barbarq-art-requirement", "菇霸争夺战部分美术需求", "barbarq-art-requirement.json"],
  ["barbarq-art-sheet", "菇霸争夺战美术需求表", "barbarq-art-sheet.json"],
  ["game-town-expanded-design", "游戏小镇方案补全文档", "game-town-expanded-design.json"],
  ["game-town-prototype-readme", "游戏小镇原型说明", "game-town-prototype-readme.json"],
  ["game-town-art-doc", "游戏小镇美术需求文档"],
  ["system-planner-game-overview", "游戏经历可视化总览"],
  ["game-town-archive", "游戏小镇完整打包文件"],
];

function getPortfolioOrderRank(item: Pick<PortfolioItem, "id" | "title" | "publicUrl" | "previewUrl" | "sourcePath" | "featured" | "updatedAt">) {
  const searchable = [item.title, item.publicUrl, item.previewUrl, item.sourcePath].filter(Boolean).join(" ");
  const preferredIndex = preferredPortfolioOrder.findIndex(
    (matchers) => matchers[0] === item.id || matchers.slice(1).some((matcher) => searchable.includes(matcher)),
  );

  if (preferredIndex >= 0) {
    return preferredIndex;
  }

  return preferredPortfolioOrder.length + (item.featured ? 0 : 100);
}

export function orderPortfolioItems<T extends PortfolioItem>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftRank = getPortfolioOrderRank(left);
    const rightRank = getPortfolioOrderRank(right);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return right.updatedAt.localeCompare(left.updatedAt) || left.title.localeCompare(right.title, "zh-Hans-CN");
  });
}

export function normalizePortfolioItems<T extends PortfolioItem>(items: T[]) {
  return orderPortfolioItems(items.filter(isPublicPortfolioItem));
}

function isSamePortfolioItem(left: PortfolioItem, right: PortfolioItem) {
  const leftSignals = new Set([left.id, left.title, left.previewUrl, left.publicUrl, left.sourcePath].filter(Boolean));
  return [right.id, right.title, right.previewUrl, right.publicUrl, right.sourcePath].filter(Boolean).some((signal) => leftSignals.has(signal));
}

const requiredPortfolioSeedIds = new Set([
  "game-town-config-sheets",
  "ninja-rogue-system-portfolio",
  "ninja-rogue-config-workbook",
  "ninja-rogue-design-proposal",
  "ninja-rogue-prd",
  "ninja-rogue-unity-demo",
  "ninja-rogue-demo-screenshot",
  "ninja-rogue-readme",
  "ninja-rogue-idea-pitch",
  "ninja-rogue-art-request",
  "ninja-rogue-implementation-plan",
  "ninja-rogue-delivery-guide",
  "ninja-rogue-research-notes",
  "ninja-rogue-asset-sources",
  "ninja-rogue-system-portfolio-docx",
]);

export function ensureRequiredPortfolioItems(items: PortfolioItem[]) {
  const visibleItems = normalizePortfolioItems(items);
  if (visibleItems.length === 0) {
    return portfolioItems;
  }

  const missingRequiredSeeds = portfolioItems.filter(
    (seed) => requiredPortfolioSeedIds.has(seed.id) && !visibleItems.some((item) => isSamePortfolioItem(item, seed)),
  );

  return orderPortfolioItems([...visibleItems, ...missingRequiredSeeds]);
}

export const portfolioProjectLabels: Record<Exclude<PortfolioProject, "all">, string> = {
  "ninja-rogue": "忍三 Rogue 模式",
  barbarq: "野蛮人大作战",
  "game-town": "游戏小镇",
  "system-planner": "系统策划",
};

export const portfolioKindLabels: Record<PortfolioKind, string> = {
  pdf: "PDF",
  excel: "Excel",
  docx: "DOCX",
  "html-prototype": "HTML 原型",
  image: "图片",
  archive: "压缩包",
  markdown: "Markdown",
  text: "文本",
};

export const portfolioFilters: Array<{ id: PortfolioProject | PortfolioKind; label: string }> = [
  { id: "all", label: "全部" },
  { id: "ninja-rogue", label: portfolioProjectLabels["ninja-rogue"] },
  { id: "barbarq", label: portfolioProjectLabels.barbarq },
  { id: "game-town", label: portfolioProjectLabels["game-town"] },
  { id: "system-planner", label: portfolioProjectLabels["system-planner"] },
  { id: "html-prototype", label: "可交互原型" },
  { id: "pdf", label: portfolioKindLabels.pdf },
  { id: "excel", label: portfolioKindLabels.excel },
];

const rawPortfolioItems: PortfolioItem[] = [
  {
    id: "ninja-rogue-system-portfolio",
    title: "忍三 Rogue 模式系统作品集",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "pdf",
    kindLabel: "PDF",
    summary: "围绕《忍者必须死3》限时肉鸽活动构想整理的系统策划作品集，覆盖点子、循环、角色/武器构筑、门奖励和落地证明。",
    tags: ["忍三", "肉鸽活动", "系统策划"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/NinjaRogue_SystemPortfolio.pdf`,
    previewUrl: `${previewRoot}/ninja-rogue-system-portfolio.json`,
    thumbnailUrl: `${assetRoot}/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Outputs\\DocxRender\\NinjaRogue_SystemPortfolio.pdf",
    updatedAt: "2026-07-29",
    featured: true,
    downloadable: true,
  },
  {
    id: "ninja-rogue-config-workbook",
    title: "忍三 Rogue 模式配置表",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "excel",
    kindLabel: "Excel",
    summary: "角色、武器、房间流、奖励规则、里程碑和美术需求等 8 个工作表，展示系统字段拆分和 Unity 配置落地能力。",
    tags: ["Excel", "配置表", "Unity 配置"],
    publicUrl: `${assetRoot}/ninja-rogue/sheets/NinjaRogue_ConfigWorkbook.xlsx`,
    previewUrl: `${previewRoot}/ninja-rogue-config-workbook.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Outputs\\NinjaRogue_ConfigWorkbook.xlsx",
    updatedAt: "2026-07-29",
    featured: true,
    downloadable: true,
  },
  {
    id: "ninja-rogue-design-proposal",
    title: "忍三 Rogue 模式系统策划案",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "完整系统策划案，说明活动定位、核心循环、局内成长、分支门、构筑体验和正式接入方案。",
    tags: ["系统策划案", "肉鸽循环", "Markdown"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/02_Game_Design_Proposal.md`,
    previewUrl: `${previewRoot}/ninja-rogue-design-proposal.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\02_Game_Design_Proposal.md",
    updatedAt: "2026-07-29",
    featured: true,
    downloadable: true,
  },
  {
    id: "ninja-rogue-prd",
    title: "忍三 Rogue 模式 PRD",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "面向开发验收的 PRD，包含模块拆分、规则口径、交互状态、配置字段和验收标准。",
    tags: ["PRD", "验收口径", "系统规则"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/03_PRD.md`,
    previewUrl: `${previewRoot}/ninja-rogue-prd.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\03_PRD.md",
    updatedAt: "2026-07-29",
    featured: true,
    downloadable: true,
  },
  {
    id: "ninja-rogue-unity-demo",
    title: "忍三 Rogue 模式 Unity 工程下载包",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "archive",
    kindLabel: "ZIP",
    summary: "可下载的 Unity demo 工程包，包含场景、脚本、配置、占位资源和输出文档；下载后用 Unity 2022.3.62f3c1 打开运行。",
    tags: ["Unity Demo", "下载工程", "可试玩原型"],
    publicUrl: `${assetRoot}/ninja-rogue/archive/NinjaRogueModePrototype_UnityProject.zip`,
    thumbnailUrl: `${assetRoot}/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype",
    updatedAt: "2026-07-29",
    featured: true,
    downloadable: true,
  },
  {
    id: "ninja-rogue-demo-screenshot",
    title: "忍三 Rogue 模式 Demo 截图",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "image",
    kindLabel: "图片",
    summary: "Unity demo 的中文 2D 横版水墨占位场景截图，用于快速展示单跑道切位、奖励门和角色/武器差分。",
    tags: ["Demo 截图", "Unity", "图片"],
    publicUrl: `${assetRoot}/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    previewUrl: `${assetRoot}/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    thumbnailUrl: `${assetRoot}/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Outputs\\NinjaRogue_DemoScreenshot.png",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-readme",
    title: "忍三 Rogue 模式项目说明",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "项目入口说明，包含 Quick Start、Demo 操作、交付物目录和素材使用边界。",
    tags: ["README", "项目说明", "Demo 操作"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/README.md`,
    previewUrl: `${previewRoot}/ninja-rogue-readme.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\README.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-idea-pitch",
    title: "忍三 Rogue 模式立项 Pitch",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "活动点子的提出与立项逻辑，说明为什么忍三适合做限时肉鸽活动，以及作品集想证明的能力点。",
    tags: ["立项逻辑", "活动点子", "Pitch"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/01_Idea_Pitch.md`,
    previewUrl: `${previewRoot}/ninja-rogue-idea-pitch.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\01_Idea_Pitch.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-art-request",
    title: "忍三 Rogue 模式美术需求文档",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "面向美术协作的需求拆分，覆盖角色、武器、奖励门、祭坛、场景层次和占位资产替换策略。",
    tags: ["美术需求", "协作交付", "Markdown"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/04_Art_Request_Document.md`,
    previewUrl: `${previewRoot}/ninja-rogue-art-request.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\04_Art_Request_Document.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-implementation-plan",
    title: "忍三 Rogue 模式开发计划",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "从 Demo 到正式活动落地的开发拆分，包含里程碑、模块依赖、风险和验收节奏。",
    tags: ["开发计划", "里程碑", "落地拆分"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/05_Implementation_Plan.md`,
    previewUrl: `${previewRoot}/ninja-rogue-implementation-plan.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\05_Implementation_Plan.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-delivery-guide",
    title: "忍三 Rogue 模式投递说明",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "说明 HR / 面试官应该如何阅读这个项目，以及面试时可以重点讲述的系统策划能力链路。",
    tags: ["投递说明", "面试讲述", "作品包装"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/06_Portfolio_Delivery_Guide.md`,
    previewUrl: `${previewRoot}/ninja-rogue-delivery-guide.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\06_Portfolio_Delivery_Guide.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-research-notes",
    title: "忍三 Rogue 模式竞品研究",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "竞品拆解与资料来源，记录 Skul 式双身份、门奖励、随机构筑成长如何映射到忍三活动设计。",
    tags: ["竞品研究", "Skul", "设计映射"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/07_Research_Notes.md`,
    previewUrl: `${previewRoot}/ninja-rogue-research-notes.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\07_Research_Notes.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-asset-sources",
    title: "忍三 Rogue 模式素材来源说明",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "说明 Demo 占位素材来源、授权边界和正式接入时应替换的商业资源映射。",
    tags: ["素材来源", "授权边界", "占位资源"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/08_Asset_Sources.md`,
    previewUrl: `${previewRoot}/ninja-rogue-asset-sources.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Docs\\08_Asset_Sources.md",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "ninja-rogue-system-portfolio-docx",
    title: "忍三 Rogue 模式作品集源文件",
    project: "ninja-rogue",
    projectLabel: "忍三 Rogue 模式",
    kind: "docx",
    kindLabel: "DOCX",
    summary: "系统作品集的 DOCX 源文件，保留原始文档结构，便于下载查看和二次整理。",
    tags: ["DOCX", "源文件", "作品集"],
    publicUrl: `${assetRoot}/ninja-rogue/docs/NinjaRogue_SystemPortfolio.docx`,
    previewUrl: `${previewRoot}/ninja-rogue-system-portfolio-docx.json`,
    sourcePath: "E:\\u3d project\\NinjaRogueModePrototype\\Outputs\\NinjaRogue_SystemPortfolio.docx",
    updatedAt: "2026-07-29",
    downloadable: true,
  },
  {
    id: "barbarq-main-design",
    title: "野蛮人大作战2 - 菇霸争夺战策划案",
    project: "barbarq",
    projectLabel: "野蛮人大作战",
    kind: "pdf",
    kindLabel: "PDF",
    summary: "围绕菇霸争夺战玩法模式整理的规则、目标、节奏与核心体验说明。",
    tags: ["玩法模式", "战斗规则", "活动策划"],
    publicUrl: `${assetRoot}/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf`,
    previewUrl: `${previewRoot}/barbarq-main-design.json`,
    sourcePath: "E:\\工作相关\\野蛮人大作战2-菇霸争夺战.pdf",
    updatedAt: "2026-04-07",
    featured: true,
    downloadable: true,
  },
  {
    id: "barbarq-main-sheet",
    title: "菇霸争夺战配置表",
    project: "barbarq",
    projectLabel: "野蛮人大作战",
    kind: "excel",
    kindLabel: "Excel",
    summary: "玩法配置与数据拆分表，适合展示系统拆解、表结构和可落地配置能力。",
    tags: ["Excel", "配置表", "数值拆解"],
    publicUrl: `${assetRoot}/barbarq/sheets/野蛮人大作战2-菇霸争夺战.xlsx`,
    previewUrl: `${previewRoot}/barbarq-main-sheet.json`,
    sourcePath: "E:\\工作相关\\野蛮人大作战2-菇霸争夺战.xlsx",
    updatedAt: "2026-04-13",
    featured: true,
    downloadable: true,
  },
  {
    id: "barbarq-art-requirement",
    title: "菇霸争夺战部分美术需求",
    project: "barbarq",
    projectLabel: "野蛮人大作战",
    kind: "pdf",
    kindLabel: "PDF",
    summary: "玩法设计转化到美术需求的说明，展示需求拆分、表达和协作交付。",
    tags: ["美术需求", "协作文档", "PDF"],
    publicUrl: `${assetRoot}/barbarq/docs/野蛮人大作战2-菇霸争夺战部分美术需求.pdf`,
    previewUrl: `${previewRoot}/barbarq-art-requirement.json`,
    sourcePath: "E:\\工作相关\\野蛮人大作战2-菇霸争夺战部分美术需求.pdf",
    updatedAt: "2026-04-07",
    downloadable: true,
  },
  {
    id: "barbarq-art-sheet",
    title: "菇霸争夺战美术需求表",
    project: "barbarq",
    projectLabel: "野蛮人大作战",
    kind: "excel",
    kindLabel: "Excel",
    summary: "与美术需求 PDF 对应的表格版本，便于生产跟踪和字段管理。",
    tags: ["Excel", "美术需求", "生产跟踪"],
    publicUrl: `${assetRoot}/barbarq/sheets/野蛮人大作战2-菇霸争夺战部分美术需求.xlsx`,
    previewUrl: `${previewRoot}/barbarq-art-sheet.json`,
    sourcePath: "E:\\工作相关\\野蛮人大作战2-菇霸争夺战部分美术需求.xlsx",
    updatedAt: "2026-04-01",
    downloadable: true,
  },
  {
    id: "system-planner-portfolio",
    title: "系统策划实习生作品集",
    project: "system-planner",
    projectLabel: "系统策划",
    kind: "pdf",
    kindLabel: "PDF",
    summary: "最终投递版作品集，集中展示系统拆解、文档表达和策划分析能力。",
    tags: ["作品集", "系统策划", "PDF"],
    publicUrl: `${assetRoot}/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf`,
    previewUrl: `${previewRoot}/system-planner-portfolio.json`,
    sourcePath: "E:\\策划文档\\系统策划实习生投递包\\最终投递版\\01_作品集_系统策划实习生_最终投递版.pdf",
    updatedAt: "2026-06-16",
    featured: true,
    downloadable: true,
  },
  {
    id: "system-planner-war-sheet",
    title: "战意 / 骑砍2 / 全面战争系统拆解案",
    project: "system-planner",
    projectLabel: "系统策划",
    kind: "excel",
    kindLabel: "Excel",
    summary: "横向拆解多个战争题材游戏的系统结构、循环与可借鉴设计点。",
    tags: ["系统拆解", "Excel", "战争题材"],
    publicUrl: `${assetRoot}/system-planner/sheets/系统策划拆解案_战意_骑砍2_全面战争.xlsx`,
    previewUrl: `${previewRoot}/system-planner-war-sheet.json`,
    sourcePath: "E:\\策划文档\\系统策划实习生投递包\\最终投递版\\系统策划拆解案_战意_骑砍2_全面战争.xlsx",
    updatedAt: "2026-06-16",
    featured: true,
    downloadable: true,
  },
  {
    id: "system-planner-war-prototype",
    title: "3D战争界面 HTML 交互原型",
    project: "system-planner",
    projectLabel: "系统策划",
    kind: "html-prototype",
    kindLabel: "HTML 原型",
    summary: "可直接交互的战意赛季经济闭环界面原型，用于面试补充展示。",
    tags: ["可交互原型", "HTML", "界面设计"],
    publicUrl: `${assetRoot}/system-planner/prototypes/war-ui/index.html`,
    previewUrl: `${assetRoot}/system-planner/prototypes/war-ui/index.html`,
    sourcePath: "E:\\策划文档\\系统策划实习生投递包\\最终投递版\\03_3D战争界面HTML原型_面试补充.html",
    updatedAt: "2026-06-16",
    featured: true,
    downloadable: true,
  },
  {
    id: "system-planner-game-overview",
    title: "游戏经历可视化总览",
    project: "system-planner",
    projectLabel: "系统策划",
    kind: "image",
    kindLabel: "图片",
    summary: "将游戏经历和品类覆盖整理成可视化图，适合作为作品集辅助材料。",
    tags: ["可视化", "游戏经历", "图片"],
    publicUrl: `${assetRoot}/system-planner/images/game_experience_overview.png`,
    previewUrl: `${assetRoot}/system-planner/images/game_experience_overview.png`,
    thumbnailUrl: `${assetRoot}/system-planner/images/game_experience_overview.png`,
    sourcePath: "E:\\策划文档\\resume_game_visuals\\game_experience_overview.png",
    updatedAt: "2026-06-18",
    downloadable: true,
  },
  {
    id: "game-town-prototype",
    title: "游戏小镇微信小程序交互原型",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "html-prototype",
    kindLabel: "HTML 原型",
    summary: "登录、分身创建、小镇、地图、冒险、背包、角色、招募、战斗等核心链路均可点击。",
    tags: ["可交互原型", "微信小程序", "模拟经营"],
    publicUrl: `${assetRoot}/game-town/prototype/index.html`,
    previewUrl: `${assetRoot}/game-town/prototype/index.html`,
    thumbnailUrl: `${assetRoot}/game-town/images/visual-concept.png`,
    sourcePath: "E:\\游戏小镇\\index.html",
    updatedAt: "2026-06-10",
    featured: true,
    downloadable: true,
  },
  {
    id: "game-town-design-doc",
    title: "游戏小镇方案完善版",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "docx",
    kindLabel: "DOCX",
    summary: "完整方案文档，包含玩法设定、系统结构、美术需求和开发说明。",
    tags: ["方案文档", "模拟经营", "DOCX"],
    publicUrl: `${assetRoot}/game-town/docs/游戏小镇方案V_0.2完善版(1).docx`,
    previewUrl: `${previewRoot}/game-town-design-doc.json`,
    sourcePath: "E:\\游戏小镇\\游戏小镇方案V_0.2完善版(1).docx",
    updatedAt: "2026-06-10",
    downloadable: true,
  },
  {
    id: "game-town-expanded-design",
    title: "游戏小镇方案补全文档",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "补充玩法、地图、怪物、村落和系统配置说明，适合快速阅读设计思路。",
    tags: ["方案补充", "Markdown", "系统设计"],
    publicUrl: `${assetRoot}/game-town/docs/游戏小镇方案补全文档.md`,
    previewUrl: `${previewRoot}/game-town-expanded-design.json`,
    sourcePath: "E:\\游戏小镇\\游戏小镇方案补全文档.md",
    updatedAt: "2026-06-10",
    downloadable: true,
  },
  {
    id: "game-town-prototype-readme",
    title: "游戏小镇原型说明",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "markdown",
    kindLabel: "Markdown",
    summary: "说明原型入口、可交互链路和配套表格，方便 HR 先理解项目结构。",
    tags: ["原型说明", "Markdown", "阅读指南"],
    publicUrl: `${assetRoot}/game-town/docs/README-原型说明.md`,
    previewUrl: `${previewRoot}/game-town-prototype-readme.json`,
    sourcePath: "E:\\游戏小镇\\README-原型说明.md",
    updatedAt: "2026-06-10",
    downloadable: true,
  },
  {
    id: "game-town-art-doc",
    title: "游戏小镇美术需求文档",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "html-prototype",
    kindLabel: "HTML 文档",
    summary: "美术需求 HTML 文档，可在站内直接打开阅读。",
    tags: ["美术需求", "HTML", "生产协作"],
    publicUrl: `${assetRoot}/game-town/docs/游戏小镇美术需求文档.html`,
    previewUrl: `${assetRoot}/game-town/docs/游戏小镇美术需求文档.html`,
    sourcePath: "E:\\游戏小镇\\游戏小镇美术需求文档.html",
    updatedAt: "2026-06-10",
    downloadable: true,
  },
  {
    id: "game-town-config-sheets",
    title: "游戏小镇系统配置表合集",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "excel",
    kindLabel: "Excel 合集",
    summary: "NPC、物品、任务、土地、地域、事件、建筑、怪物、装备等 12 个配置表。",
    tags: ["Excel", "配置表", "系统设计"],
    publicUrl: `${assetRoot}/game-town/sheets/NPC表.xlsx`,
    previewUrl: `${previewRoot}/game-town-config-sheets.json`,
    sourcePath: "E:\\游戏小镇\\相关表格",
    updatedAt: "2026-06-10",
    featured: true,
    downloadable: true,
  },
  {
    id: "game-town-archive",
    title: "游戏小镇完整打包文件",
    project: "game-town",
    projectLabel: "游戏小镇",
    kind: "archive",
    kindLabel: "RAR",
    summary: "完整工程与作品素材打包，提供下载留档。",
    tags: ["压缩包", "完整归档", "下载"],
    publicUrl: `${assetRoot}/game-town/archive/游戏小镇.rar`,
    sourcePath: "E:\\游戏小镇\\游戏小镇.rar",
    updatedAt: "2026-06-11",
    downloadable: true,
  },
];

export const portfolioItems = normalizePortfolioItems(rawPortfolioItems);
