import { createVerificationClient } from "./create-verification-client.mjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucketName = process.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";
const ownerEmail = process.env.OWNER_EMAIL || process.env.AUTH_EMAIL_TO || process.env.GMAIL_ADDRESS;
const ownerPassword = process.env.OWNER_PASSWORD || process.env.AUTH_OWNER_PASSWORD;
const failures = [];
const cleanupTasks = [];

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

function getSafeFileExtension(fileName, mimeType = "") {
  const extension = fileName.match(/\.([^.]+)$/)?.[1]?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  if (extension) {
    return extension;
  }

  const fallbacks = {
    "audio/flac": "flac",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "image/jpeg": "jpg",
    "image/png": "png",
  };

  return fallbacks[mimeType.toLowerCase()] ?? "bin";
}

function createSafeStorageFileName(fileName, mimeType, fallbackStem = "upload") {
  const leafName = fileName.split(/[\\/]/).pop() ?? "";
  const rawStem = leafName.replace(/\.[^.]+$/, "");
  const safeStem = rawStem
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const extension = getSafeFileExtension(fileName, mimeType);

  return `${safeStem || fallbackStem}.${extension}`;
}

function createSupabaseStoragePath(folder, ownerId, fileName, mimeType, fallbackStem) {
  const safeOwnerId = ownerId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const safeFileName = createSafeStorageFileName(fileName, mimeType, fallbackStem);

  return `${folder}/${safeOwnerId}/${Date.now()}-${randomSuffix}-${safeFileName}`;
}

function describeStorageError(error, path) {
  if (!error) {
    return "";
  }

  return `${error.message || "unknown error"} at ${path}`;
}

async function cleanup(label, task) {
  cleanupTasks.push(async () => {
    try {
      await task();
    } catch (error) {
      console.warn(`WARN cleanup failed for ${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

async function uploadFixture(supabase, userId, folder, fileName, mimeType, bytes, fallbackStem) {
  const storagePath = createSupabaseStoragePath(folder, userId, fileName, mimeType, fallbackStem);
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, new Blob([bytes], { type: mimeType }), {
      contentType: mimeType,
      upsert: false,
    });

  assert(!error, `${folder} accepts owner upload with unsafe original filename`, describeStorageError(error, storagePath));
  assert(
    [...storagePath].every((character) => character.charCodeAt(0) <= 127),
    `${folder} storage path is ASCII-safe`,
    storagePath,
  );
  assert(!storagePath.includes("'"), `${folder} storage path removes apostrophes`, storagePath);
  assert(!storagePath.includes(" "), `${folder} storage path removes spaces`, storagePath);

  if (!error) {
    await cleanup(storagePath, () => supabase.storage.from(bucketName).remove([storagePath]));
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  assert(Boolean(data.publicUrl), `${folder} public URL can be generated after upload`);

  return { storagePath, publicUrl: data.publicUrl };
}

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    fail(
      "Supabase environment configured",
      "set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this check",
    );
  }

  if (!ownerEmail || !ownerPassword) {
    fail(
      "Owner credentials configured for real upload check",
      "set OWNER_EMAIL and OWNER_PASSWORD only in your local terminal or .env.local; never commit them",
    );
  }

  if (failures.length === 0) {
    const supabase = createVerificationClient(supabaseUrl, supabaseAnonKey);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: ownerEmail,
      password: ownerPassword,
    });

    assert(!signInError, "owner can sign in for real upload check", signInError?.message);
    const userId = signInData.user?.id;
    assert(Boolean(userId), "owner session has a user id");

    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,email")
        .eq("id", userId)
        .single();

      assert(!profileError, "owner profile is readable", profileError?.message);
      assert(profile?.role === "owner", "signed-in account is owner", `role=${profile?.role ?? "missing"}`);

      if (profile?.role === "owner") {
        const audioUpload = await uploadFixture(
          supabase,
          userId,
          "music-audio",
          "Andrew Prahlow - Travelers' encore.flac",
          "audio/flac",
          new Uint8Array([0x66, 0x4c, 0x61, 0x43, 0x00, 0x00, 0x00, 0x22]),
          "music-audio",
        );
        const coverUpload = await uploadFixture(
          supabase,
          userId,
          "music-cover",
          "星际拓荒.jpg",
          "image/jpeg",
          new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0xff, 0xd9]),
          "music-cover",
        );

        const { data: track, error: trackError } = await supabase
          .from("music_tracks")
          .insert({
            owner_id: userId,
            title: `owner upload healthcheck ${Date.now()}`,
            artist: "Codex verification",
            mood: "upload feedback",
            duration: "00:01",
            audio_url: audioUpload.publicUrl,
            cover_url: coverUpload.publicUrl,
            is_background: false,
            published: true,
          })
          .select("id,title,audio_url,cover_url")
          .single();

        assert(!trackError, "owner can save uploaded music track", trackError?.message);
        assert(Boolean(track?.id), "saved music track returns id");

        if (track?.id) {
          await cleanup(`music track ${track.id}`, () => supabase.from("music_tracks").delete().eq("id", track.id));

          const { error: deleteError } = await supabase.from("music_tracks").delete().eq("id", track.id);
          assert(!deleteError, "owner can delete uploaded music track", deleteError?.message);
        }
      }
    }
  }
} finally {
  for (const task of cleanupTasks.reverse()) {
    await task();
  }
}

if (failures.length > 0) {
  console.error(`\nOwner music storage verification failed with ${failures.length} issue(s).`);
  console.error("If upload checks fail with 400 or RLS, run supabase/fix-live-database.sql in Supabase SQL Editor, then retry.");
  process.exit(1);
}

console.log("\nOwner music storage verification passed.");
