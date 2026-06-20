import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync("src/lib/readingImport.ts", "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const module = { exports: {} };
new Function("module", "exports", transpiled)(module, module.exports);
const { cleanPastedReadingText, parseTags, parseReadingClipboardText } = module.exports;
const failures = [];

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`PASS ${label}`);
    return;
  }

  failures.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

const labeledImport = parseReadingClipboardText(`
书名：《体验引擎》
作者：Jesse Schell
摘录：把体验拆成可以被反复审视的镜头。
心得：适合做策划复盘清单。
也可以继续写第二行心得。
标签：体验设计, 系统拆解
`);

assert(labeledImport.kind === "book", "labeled import sets book kind");
assert(labeledImport.title === "体验引擎", "labeled import parses title");
assert(labeledImport.creator === "Jesse Schell", "labeled import parses creator");
assert(labeledImport.quote === "把体验拆成可以被反复审视的镜头。", "labeled import parses quote");
assert(
  labeledImport.reflection === "适合做策划复盘清单。\n也可以继续写第二行心得。",
  "labeled import preserves multiline reflection",
);
assert(
  JSON.stringify(labeledImport.tags) === JSON.stringify(["体验设计", "系统拆解"]),
  "labeled import parses tags",
);

const titleLineImport = parseReadingClipboardText(`
《游戏设计艺术》 - Jesse Schell
Lens are a way of seeing design decisions again.
`);

assert(titleLineImport.title === "游戏设计艺术", "title-line import parses Chinese book brackets");
assert(titleLineImport.creator === "Jesse Schell", "title-line import parses creator suffix");
assert(titleLineImport.quote === "Lens are a way of seeing design decisions again.", "title-line import keeps following quote");

const plainImport = parseReadingClipboardText("只复制一段喜欢的书摘，也应该直接进入段落。");
assert(plainImport.quote === "只复制一段喜欢的书摘，也应该直接进入段落。", "plain import becomes quote");
assert(!plainImport.title, "plain import does not invent title");

const alternateLabelsImport = parseReadingClipboardText(`
书籍：游戏机制高级设计
出处：Ernest Adams
书摘：规则不是限制，而是体验的语言。
笔记：这句话适合放到系统设计方法论里。
`);

assert(alternateLabelsImport.title === "游戏机制高级设计", "alternate labels parse book title");
assert(alternateLabelsImport.creator === "Ernest Adams", "alternate labels parse source");
assert(alternateLabelsImport.quote === "规则不是限制，而是体验的语言。", "alternate labels parse book excerpt");
assert(alternateLabelsImport.reflection === "这句话适合放到系统设计方法论里。", "alternate labels parse note reflection");

assert(cleanPastedReadingText(` A

 B `) === "A\nB", "pasted text is trimmed and normalized");
assert(JSON.stringify(parseTags("体验设计，系统拆解\n关卡")) === JSON.stringify(["体验设计", "系统拆解", "关卡"]), "tag parser accepts comma and newline");

if (failures.length > 0) {
  console.error(`\nReading import verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nReading import verification passed.");
