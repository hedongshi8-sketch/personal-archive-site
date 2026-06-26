import { readFileSync } from "node:fs";

const siteData = readFileSync("src/data/siteData.ts", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const seedSql = readFileSync("supabase/seed-reading-notes.sql", "utf8");
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
  "通关！游戏设计之道（第2版）",
  "游戏设计艺术（第2版）",
  "游戏设计基础",
  "体验引擎：游戏设计全景探秘",
  "游戏机制：高级游戏设计技术",
  "游戏设计入门：理解玩家思维",
  "游戏情感设计：如何触动玩家的心灵",
];

for (const title of requiredBooks) {
  assert(siteData.includes(`title: "${title}"`), `static reading seed includes ${title}`);
  assert(seedSql.includes(`'${title}'`), `Supabase reading seed includes ${title}`);
}

assert(!siteData.includes("title: \"游戏心理学\""), "missing 游戏心理学 is not fabricated");
assert(!siteData.includes("title: \"社会心理学\""), "missing 社会心理学 is not fabricated");
assert(siteData.includes("玩家心理") && siteData.includes("游戏心理"), "psychology tags are available for substitute sources");
assert(countMatches(siteData, /id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a2\d{2}"/g) === 11, "static reading seed count is 11");
assert(countMatches(seedSql, /::public\.reading_note_kind/g) === 11, "Supabase reading seed count is 11");
assert(appSource.includes("useState<ReadingNote[]>(readingNotes)"), "reading page shows seed notes before Supabase sync finishes");
for (let index = 201; index <= 211; index += 1) {
  const id = `0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a${index}`;
  assert(siteData.includes(`id: "${id}"`), `static reading seed uses UUID ${id}`);
  assert(seedSql.includes(`'${id}'::uuid`), `Supabase reading seed uses UUID ${id}`);
}
assert(countMatches(siteData, /reflection: ""/g) === 11, "seed reading notes have empty reflections");
for (const quote of [
  "短摘：游戏玩法应该是你要一直琢磨的。",
  "短摘：玩游戏的场景对游戏会产生巨大的影响。",
  "短摘：玩家做出的决定会反映他的游戏风格。",
  "目录摘记：情感触发器、虚构层、心流和沉浸共同构成体验引擎。",
  "短摘：你必须在长远目标和短期需求之间找到一个平衡点。",
  "短摘：在游戏一开始就设计一些小回报。",
  "短摘：玩家通过游戏角色把自己和虚拟形象联系起来。",
]) {
  assert(siteData.includes(quote), `static reading seed includes ${quote}`);
  assert(seedSql.includes(quote), `Supabase reading seed includes ${quote}`);
}
assert(siteData.includes("短摘：") && siteData.includes("目录摘记："), "reading seeds are labeled as excerpts or outline notes");
assert(readFileSync("docs/reading-seeds.md", "utf8").includes("reflection` 统一留空"), "reading seed docs explain no reviews are written");
assert(appSource.includes("function mergeReadingNotesWithSeeds"), "reading seeds merge with remote notes");
assert(appSource.includes("setNotes(mergeReadingNotesWithSeeds(remoteNotes))"), "Supabase reading list falls back to seeds");
assert(seedSql.includes("on conflict (id) do update set"), "Supabase reading seed is rerunnable");
assert(seedSql.includes("owner_profile"), "Supabase reading seed attaches owner profile when available");

if (failures.length > 0) {
  console.error(`\nReading seed verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nReading seed verification passed.");
