import { readFileSync } from "node:fs";

const siteData = readFileSync("src/data/siteData.ts", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const seedSql = readFileSync("supabase/seed-reading-notes.sql", "utf8");
const docs = readFileSync("docs/reading-seeds.md", "utf8");
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

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

const requiredBooks = [
  "体验引擎：游戏设计全景探秘",
  "大师谈游戏设计：创意与节奏",
  "平衡掌控者：游戏数值战斗设计",
  "凭什么让你充值：一个游戏策划的自我修养",
  "游戏改变世界：游戏化如何让现实变得更美好",
  "Unity游戏开发（原书第3版）",
];

for (const title of requiredBooks) {
  assert(siteData.includes(`title: "${title}"`), `static reading seed includes ${title}`);
  assert(seedSql.includes(`'${title}'`), `Supabase reading seed includes ${title}`);
}

for (const legacyText of [
  "短摘：游戏玩法应该是你要一直琢磨的。",
  "短摘：把游戏的流程、玩法以及细节都写出来。",
  "短摘：玩游戏的场景对游戏会产生巨大的影响。",
  "短摘：想出创意，尝试制作，不断测试和改进。",
  "短摘：玩家做出的决定会反映他的游戏风格。",
  "短摘：玩家非常喜欢定义自己。",
]) {
  assert(!siteData.includes(legacyText), `static reading seed removed legacy filler ${legacyText}`);
  assert(!seedSql.includes(legacyText), `Supabase reading seed removed legacy filler ${legacyText}`);
}

assert(!siteData.includes('title: "游戏心理学"'), "missing 游戏心理学 is not fabricated");
assert(!siteData.includes('title: "社会心理学"'), "missing 社会心理学 is not fabricated");
assert(siteData.includes("情感触发") && siteData.includes("玩家需求") && siteData.includes("数值设计"), "practical planning tags are available");
assert(countMatches(siteData, /id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a2\d{2}"/g) === 11, "static reading seed count is 11");
assert(countMatches(seedSql, /::public\.reading_note_kind/g) === 11, "Supabase reading seed count is 11");
assert(countMatches(siteData, /reflection: ""/g) === 0, "seed reading notes include planning reflections");
assert(appSource.includes("useState<ReadingNote[]>(readingNotes)"), "reading page shows seed notes before Supabase sync finishes");
assert(appSource.includes("legacyReadingSeedQuotes") && appSource.includes("replaceLegacyReadingSeed"), "reading merge replaces known legacy remote seed rows");

for (let index = 201; index <= 211; index += 1) {
  const id = `0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a${index}`;
  assert(siteData.includes(`id: "${id}"`), `static reading seed uses UUID ${id}`);
  assert(seedSql.includes(`'${id}'::uuid`), `Supabase reading seed uses UUID ${id}`);
}

for (const quote of [
  "要点摘记：体验不是只由机制产生",
  "要点摘记：技巧章节把深度、无障碍、弹性挑战、训练、失败处理放在一起看",
  "要点摘记：核心创意拆成主题、概念、系统",
  "要点摘记：过关和失败画面也有节奏",
  "要点摘记：数值策划不是解数学题",
  "要点摘记：Excel、公式、技能、装备、随机、战斗数据结构和模拟验证",
  "要点摘记：先制造「想要」",
  "要点摘记：N+1、套装属性、质变成长和保值问题",
  "要点摘记：好游戏给玩家明确任务、主动选择的挑战和及时反馈",
  "要点摘记：失败如果被设计得有趣",
  "要点摘记：Unity 学习路径强调编辑器视图、场景导航、Game 视图测试和案例工程",
]) {
  assert(siteData.includes(quote), `static reading seed includes ${quote}`);
  assert(seedSql.includes(quote), `Supabase reading seed includes ${quote}`);
}

assert(siteData.includes("要点摘记：") && siteData.includes("策划用法："), "reading seeds are labeled as extracted notes and planning use");
assert(docs.includes("D:\\BaiduNetdiskDownload\\L850\\游戏设计合集1"), "reading seed docs record the local source path");
assert(docs.includes("EPUB") && docs.includes("不逐字搬运大段原文"), "reading seed docs explain the extraction boundary");
assert(appSource.includes("function mergeReadingNotesWithSeeds"), "reading seeds merge with remote notes");
assert(appSource.includes("setNotes(mergeReadingNotesWithSeeds(remoteNotes))"), "Supabase reading list falls back to seeds");
assert(seedSql.includes("on conflict (id) do update set"), "Supabase reading seed is rerunnable");
assert(seedSql.includes("owner_profile"), "Supabase reading seed attaches owner profile when available");

if (failures.length > 0) {
  console.error(`\nReading seed verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nReading seed verification passed.");
