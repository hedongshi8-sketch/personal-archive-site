import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src", "App.tsx"), "utf8");
const backendSource = readFileSync(join(root, "src", "lib", "backendContract.ts"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const envExample = readFileSync(join(root, ".env.example"), "utf8");
const fixSql = readFileSync(join(root, "supabase", "fix-live-database.sql"), "utf8");
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

function includes(source, text, label) {
  assert(source.includes(text), label, `missing ${text}`);
}

includes(appSource, "freeSupabaseMusicUploadLimitBytes = 50 * 1024 * 1024", "front end defaults music uploads to Supabase Free global limit");
includes(appSource, "hasCustomMusicUploadLimit", "front end upload limit can only be raised explicitly");
includes(appSource, "VITE_MAX_MUSIC_UPLOAD_MB", "front end exposes an opt-in upload limit override");
includes(appSource, "SQL 只能调 bucket 上限，不能突破项目全局上限", "oversized picker error explains SQL cannot bypass global limit");
includes(appSource, "这不是你电脑内存问题", "large upload progress explains failures are not local memory");
includes(appSource, "6 MB 以上音频会自动用 Supabase TUS 分片上传", "music panel explains resumable upload behavior");
includes(appSource, "粘贴下方“音频 URL”", "oversized picker points to external URL fallback");

includes(backendSource, "freeSupabaseProjectUploadLimitBytes = 50 * 1024 * 1024", "backend upload errors know Supabase Free global limit");
includes(backendSource, "bucket 的 file_size_limit 只能在全局上限以内生效", "backend oversized error explains bucket limit scope");
includes(backendSource, "运行 SQL 也无法突破项目 Global file size limit", "backend 400 error explains SQL cannot bypass global limit");
includes(backendSource, "tus.Upload", "large uploads still use TUS resumable upload");
includes(backendSource, "chunkSize: resumableUploadChunkBytes", "TUS upload uses configured chunk size");
includes(backendSource, "resumableUploadChunkBytes = 6 * 1024 * 1024", "TUS upload chunk size stays at 6 MB");

includes(envExample, "Global file size limit above 50 MB", ".env.example documents Supabase Free global limit");
includes(envExample, "SQL can raise the bucket limit, but it cannot bypass", ".env.example warns SQL cannot bypass the global limit");
includes(readme, "音乐上传限制", "README has music upload limit section");
includes(readme, "分片上传解决的是请求体过大和中途断线，不会突破 Supabase 套餐限制", "README explains what TUS does and does not solve");
includes(readme, "免费 Supabase 项目的 Storage `Global file size limit` 最高是 50 MB", "README names the real free-tier blocker");
includes(readme, "70 MB 这类 FLAC 建议先转成 50 MB 以内的 MP3/M4A", "README gives a practical 70 MB fallback");
includes(fixSql, "This bucket limit does not override Supabase's project-level Global file size limit", "live SQL warns about project global limit");

if (failures.length > 0) {
  console.error(`\nMusic upload limit verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nMusic upload limit verification passed.");
