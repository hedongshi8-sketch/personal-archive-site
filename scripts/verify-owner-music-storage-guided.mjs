import { spawnSync } from "node:child_process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import "./load-local-env.mjs";

const defaultOwnerEmail = process.env.OWNER_EMAIL || process.env.AUTH_EMAIL_TO || process.env.GMAIL_ADDRESS || "";

function redactEmail(email) {
  const [name = "", domain = ""] = email.split("@");
  if (!domain) {
    return "***";
  }

  const visibleName = name.length <= 2 ? `${name[0] ?? ""}***` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${visibleName}@${domain}`;
}

async function askVisible(question, defaultValue = "") {
  const rl = readline.createInterface({ input, output });

  try {
    const suffix = defaultValue ? ` (${redactEmail(defaultValue)})` : "";
    const answer = (await rl.question(`${question}${suffix}: `)).trim();
    return answer || defaultValue;
  } finally {
    rl.close();
  }
}

async function askHidden(question) {
  const rl = readline.createInterface({ input, output });
  const originalWrite = output.write.bind(output);

  output.write = (chunk, encoding, callback) => {
    const text = String(chunk);
    if (text.includes(question)) {
      return originalWrite(chunk, encoding, callback);
    }
    return true;
  };

  try {
    return (await rl.question(question)).trim();
  } finally {
    output.write = originalWrite;
    rl.close();
    output.write("\n");
  }
}

console.log("Guided owner music upload verification");
console.log("This signs in, uploads temporary audio/cover fixtures, saves a temporary music row, deletes it, and cleans Storage.");
console.log("The owner password is used only for this process and is not written to any file.");

const ownerEmail = await askVisible("Owner email", defaultOwnerEmail);
const ownerPassword = process.env.OWNER_PASSWORD || process.env.AUTH_OWNER_PASSWORD || await askHidden("Owner site password: ");

if (!ownerEmail || !ownerPassword) {
  console.error("FAIL Owner email and password are required for real upload verification.");
  process.exit(1);
}

const child = spawnSync(process.execPath, ["scripts/verify-owner-music-storage.mjs"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    OWNER_EMAIL: ownerEmail,
    OWNER_PASSWORD: ownerPassword,
  },
});

process.exit(child.status ?? 1);
