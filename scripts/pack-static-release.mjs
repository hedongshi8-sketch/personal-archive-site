import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, "dist");
const releaseDir = path.join(root, "release");
const zipPath = path.join(releaseDir, "personal-archive-site-static.zip");
const manifestPath = path.join(releaseDir, "personal-archive-site-static-manifest.json");

function walkFiles(startDir) {
  const files = [];

  for (const entry of fs.readdirSync(startDir, { withFileTypes: true })) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let crc = i;
  for (let j = 0; j < 8; j += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  crcTable[i] = crc >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
}

function uint16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(files, outputPath) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const relativePath = path.relative(distDir, file).replace(/\\/g, "/");
    const nameBuffer = Buffer.from(relativePath, "utf8");
    const data = fs.readFileSync(file);
    const stat = fs.statSync(file);
    const checksum = crc32(data);
    const { dosDate, dosTime } = dosTimestamp(stat.mtime);

    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(nameBuffer.length),
      uint16(0),
      nameBuffer,
    ]);

    const centralHeader = Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(dosTime),
      uint16(dosDate),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(nameBuffer.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      nameBuffer,
    ]);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endOfCentralDirectory = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  fs.writeFileSync(outputPath, Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory]));
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error("dist/index.html is missing. Run `npm run build` first.");
  process.exit(1);
}

fs.mkdirSync(releaseDir, { recursive: true });

if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

const files = walkFiles(distDir);
const totalBytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const manifest = {
  name: "personal-archive-site-static",
  createdAt: new Date().toISOString(),
  source: "dist",
  fileCount: files.length,
  totalBytes,
  entrypoints: [
    "index.html",
    "sw.js",
    "_headers",
    "_redirects",
    "portfolio-assets/game-town/prototype/index.html",
    "portfolio-assets/system-planner/prototypes/war-ui/index.html",
  ],
  files: files.map((file) => {
    const relativePath = path.relative(distDir, file).replace(/\\/g, "/");

    return {
      path: relativePath,
      bytes: fs.statSync(file).size,
    };
  }),
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

createZip(files, zipPath);

const zipBytes = fs.statSync(zipPath).size;
console.log(`Packed ${files.length} files (${totalBytes} bytes) into:`);
console.log(zipPath);
console.log(`Zip size: ${zipBytes} bytes`);
console.log(`Manifest: ${manifestPath}`);
