import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appSource = readFileSync(join(root, "src", "App.tsx"), "utf8");
const backendSource = readFileSync(join(root, "src", "lib", "backendContract.ts"), "utf8");
const stylesSource = readFileSync(join(root, "src", "styles", "main.css"), "utf8");
const musicSectionSource = appSource.slice(
  appSource.indexOf("function MusicSection"),
  appSource.indexOf("function GallerySection"),
);

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

assertIncludes(backendSource, "createSafeStorageFileName", "safe storage filename helper exists");
assertIncludes(backendSource, "createSupabaseStoragePath", "safe Supabase storage path helper exists");
assertIncludes(backendSource, "getStorageUploadErrorMessage", "friendly storage upload error helper exists");
assertIncludes(backendSource, "formatFileSize(file.size)", "storage upload errors include file size");
assertIncludes(backendSource, "tus.Upload", "large storage uploads use TUS resumable uploads");
assertIncludes(backendSource, "/storage/v1/upload/resumable", "TUS upload endpoint is configured");
assertIncludes(backendSource, "Global file size limit", "storage upload errors mention global size limit");
assertIncludes(backendSource, "Supabase Storage 没有放行站主上传", "RLS storage error points to live database fix");
assertIncludes(backendSource, "Supabase Storage 上传失败（400）", "400 storage error has user-facing explanation");
assertIncludes(backendSource, "文件过大", "storage upload errors explain oversized files");
assertIncludes(backendSource, "status === \"413\"", "storage upload errors handle payload-too-large responses");
assertIncludes(backendSource, "createSupabaseStoragePath(`portfolio/${kind}`, owner.id, file, kind)", "portfolio uploads use safe owner-scoped storage paths");
assertIncludes(backendSource, "createSupabaseStoragePath(kind, owner.id, file, kind)", "asset uploads use safe owner-scoped storage paths");

assert(
  !backendSource.includes("portfolio/${kind}/${Date.now()}-${file.name}"),
  "portfolio uploads no longer use raw file.name in storage path",
);
assert(
  !backendSource.includes("${kind}/${Date.now()}-${file.name}"),
  "asset uploads no longer use raw file.name in storage path",
);

assertIncludes(appSource, "audioUploadState", "music audio upload state exists");
assertIncludes(appSource, "coverUploadState", "music cover upload state exists");
assertIncludes(appSource, "audioUploadMessage", "music audio upload inline feedback exists");
assertIncludes(appSource, "coverUploadMessage", "music cover upload inline feedback exists");
assertIncludes(appSource, "maxMusicUploadBytes", "music upload has a size limit guard");
assertIncludes(appSource, "largeMusicUploadBytes", "music upload distinguishes large resumable files");
assertIncludes(appSource, "formatUploadSize(file.size)", "music upload feedback includes selected file size");
assertIncludes(appSource, "音频文件太大", "oversized audio is blocked with clear feedback");
assertIncludes(appSource, "音频 URL", "music owner can paste an external audio URL");
assertIncludes(appSource, "已使用外部音频 URL", "external audio URL gives owner feedback");
assertIncludes(appSource, "isMusicActionBusy", "music action busy guard exists");
assertIncludes(appSource, "正在上传音频《", "audio upload starts with visible status");
assertIncludes(appSource, "正在上传封面《", "cover upload starts with visible status");
assertIncludes(appSource, "已填入草稿。现在点“保存音乐”", "audio upload success explains save step");
assertIncludes(appSource, "音频上传成功，已填入草稿。下一步点“保存音乐”。", "audio picker shows upload success and next step");
assertIncludes(appSource, "封面上传成功，已填入草稿。", "cover picker shows upload success");
assertIncludes(appSource, "音频上传失败：", "audio picker shows upload failure reason");
assertIncludes(appSource, "封面上传失败：", "cover picker shows upload failure reason");
assertIncludes(appSource, "音频或封面还在上传中", "save is blocked while uploading");
assertIncludes(appSource, "先上传音频文件，再点保存音乐。", "missing audio save feedback exists");
assertIncludes(appSource, "正在把音乐写入公开歌单", "save progress feedback exists");
assertIncludes(appSource, "requestDeleteTrack", "delete opens an in-page confirmation flow");
assertIncludes(appSource, "pendingDeleteTrackId", "pending delete state exists");
assertIncludes(appSource, "music-delete-confirm", "delete confirmation renders inside music panel");
assertIncludes(appSource, "等待确认", "delete button shows waiting confirmation state");
assertIncludes(appSource, "确认删除", "delete confirm action exists");
assertIncludes(appSource, "确认要删除《", "delete preparation feedback exists");
assertIncludes(appSource, "已取消删除。", "delete cancel feedback exists");
assertIncludes(appSource, "正在删除《", "delete progress feedback exists");
assertIncludes(appSource, "music-action-status", "music status is rendered near owner panel top");
assertIncludes(appSource, "isAudioUploading ? \"音频上传中...\"", "audio picker shows busy label");
assertIncludes(appSource, "isCoverUploading ? \"封面上传中...\"", "cover picker shows busy label");
assertIncludes(appSource, "deletingTrackId === activeTrack?.id ? \"删除中...\"", "delete button shows busy label");
assertIncludes(appSource, "disabled={isMusicActionBusy}", "music controls are disabled during mutations");
assertIncludes(appSource, "event.currentTarget.value = \"\"", "file pickers reset so the same failed file can be retried");

assert(!musicSectionSource.includes("window.confirm"), "music delete no longer depends on browser confirm dialog");

assertIncludes(stylesSource, ".music-action-status", "music action status style exists");
assertIncludes(stylesSource, ".music-upload-inline-status", "music inline upload status style exists");
assertIncludes(stylesSource, ".portfolio-file-picker.is-busy", "busy file picker style exists");
assertIncludes(stylesSource, ".music-delete-confirm", "music delete confirmation style exists");
assertIncludes(stylesSource, ".dark-mode .music-action-status", "music action status supports dark mode");

if (failures.length > 0) {
  console.error(`\nMusic owner flow verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nMusic owner flow verification passed.");
