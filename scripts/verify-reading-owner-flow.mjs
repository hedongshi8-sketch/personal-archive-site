import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src", "App.tsx"), "utf8");
const backendSource = readFileSync(join(root, "src", "lib", "backendContract.ts"), "utf8");
const maintenanceDocs = readFileSync(join(root, "docs", "development-maintenance.md"), "utf8");

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

function assertIncludes(source, text, label) {
  assert(source.includes(text), label, `missing ${text}`);
}

assertIncludes(backendSource, "VITE_FORCE_LOCAL_PREVIEW", "local owner preview mode is configurable");
assertIncludes(backendSource, 'role: "owner"', "local preview user has owner role");
assertIncludes(backendSource, "isLocalPreviewHost()", "local owner preview is limited to localhost");
assertIncludes(maintenanceDocs, "VITE_FORCE_LOCAL_PREVIEW", "maintenance docs document local owner preview mode");

assertIncludes(appSource, "reading-composer", "reading owner composer exists");
assertIncludes(appSource, "站主书摘发布入口", "reading composer has owner-facing title");
assertIncludes(appSource, "从剪贴板导入段落", "reading composer exposes clipboard import");
assertIncludes(appSource, "书摘发布流程", "reading workflow rail is labeled");
assertIncludes(appSource, "书摘公开发布预览", "reading public preview is labeled");
assertIncludes(appSource, "书籍 / 作品名称", "reading composer has book title field");
assertIncludes(appSource, "作者 / 来源", "reading composer has source field");
assertIncludes(appSource, "喜欢的段落", "reading composer has excerpt field");
assertIncludes(appSource, "心得评论（可选）", "reading composer has optional reflection field");
assertIncludes(appSource, "发布到书摘", "reading composer has publish action");
assertIncludes(appSource, "本地预览已新增书摘心得", "local owner publish success message exists");
assertIncludes(appSource, "书摘心得已写入 Supabase", "remote owner publish success message exists");
assertIncludes(appSource, "已切到刚发布的书摘", "published note is selected after save");
assertIncludes(appSource, "copyReadingDraftPreview", "reading draft preview copy is wired");
assertIncludes(appSource, "parseReadingClipboardText", "smart paste parser is wired");
assertIncludes(appSource, "handleSmartPaste", "manual paste into excerpt field is intercepted");

assertIncludes(backendSource, "async createReadingNote(input: ReadingNoteInput)", "reading create method exists");
assertIncludes(backendSource, "localReadingNotes = [note, ...localReadingNotes]", "local reading create mutates store");
assertIncludes(backendSource, 'requireOwner(await this.getCurrentUser(), "只有站主账号可以发布书摘心得。")', "Supabase reading create requires owner");
assertIncludes(backendSource, ".from(\"reading_notes\")", "Supabase reading notes table is wired");
assertIncludes(backendSource, "async updateReadingNote(id: string, input: ReadingNoteInput)", "reading update method exists");
assertIncludes(backendSource, "async deleteReadingNote(id: string)", "reading delete method exists");

assert(
  !/async createReadingNote\([^)]*\)\s*{\s*return;\s*}/.test(backendSource),
  "reading create is not an empty stub",
);
assert(
  !/async updateReadingNote\([^)]*\)\s*{\s*return;\s*}/.test(backendSource),
  "reading update is not an empty stub",
);
assert(
  !/async deleteReadingNote\([^)]*\)\s*{\s*return;\s*}/.test(backendSource),
  "reading delete is not an empty stub",
);

if (failures.length > 0) {
  console.error(`\nReading owner flow verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nReading owner flow verification passed.");
