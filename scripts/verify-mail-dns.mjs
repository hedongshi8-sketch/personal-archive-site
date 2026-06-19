import dns from "node:dns/promises";

const domain = stripTrailingDot(process.env.MAIL_DOMAIN ?? process.argv[2] ?? "");
const mailSubdomain = stripTrailingDot(process.env.MAIL_SUBDOMAIN ?? (domain ? `auth.${domain}` : ""));
const siteSubdomain = stripTrailingDot(process.env.SITE_DOMAIN ?? (domain ? `www.${domain}` : ""));
const failures = [];

function pass(label) {
  console.log(`PASS ${label}`);
}

function warn(label, detail = "") {
  console.warn(`WARN ${label}${detail ? `: ${detail}` : ""}`);
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

function stripTrailingDot(value) {
  return value.trim().replace(/\.$/, "");
}

function flattenTxt(records) {
  return records.map((chunks) => chunks.join(""));
}

async function resolveOrEmpty(type, name) {
  try {
    return await dns.resolve(name, type);
  } catch (error) {
    if (["ENODATA", "ENOTFOUND", "ETIMEOUT", "ESERVFAIL"].includes(error?.code)) {
      return [];
    }

    throw error;
  }
}

if (!domain) {
  fail("mail domain configured", "set MAIL_DOMAIN or pass a domain, for example npm run verify:mail-dns -- hedongshi8.com");
}

if (failures.length === 0) {
  console.log(`Checking domain=${domain} mailSubdomain=${mailSubdomain} siteSubdomain=${siteSubdomain}`);

  const apexA = await resolveOrEmpty("A", domain);
  const apexAaaa = await resolveOrEmpty("AAAA", domain);
  const apexNs = await resolveOrEmpty("NS", domain);
  assert(apexNs.length > 0 || apexA.length > 0 || apexAaaa.length > 0, "apex domain resolves", [...apexNs, ...apexA, ...apexAaaa].join(", "));

  const mailTxt = flattenTxt(await resolveOrEmpty("TXT", mailSubdomain));
  const mailMx = await resolveOrEmpty("MX", mailSubdomain);
  const mailCname = await resolveOrEmpty("CNAME", mailSubdomain);
  const hasSpf = mailTxt.some((record) => /^v=spf1\b/i.test(record));
  const hasResendSignal = [...mailTxt, ...mailCname, ...mailMx.map((record) => record.exchange)].some((record) =>
    /resend|amazonses|spf\.mtasv\.net/i.test(record),
  );

  assert(mailTxt.length > 0 || mailMx.length > 0 || mailCname.length > 0, "mail subdomain has DNS records");
  assert(hasSpf || hasResendSignal, "mail subdomain has sender verification signal", mailTxt.join(" | "));

  const dmarcCandidates = [`_dmarc.${mailSubdomain}`, `_dmarc.${domain}`];
  const dmarcRecords = [];
  for (const name of dmarcCandidates) {
    const records = flattenTxt(await resolveOrEmpty("TXT", name));
    dmarcRecords.push(...records.map((record) => ({ name, record })));
  }
  const hasDmarc = dmarcRecords.some(({ record }) => /^v=DMARC1\b/i.test(record));
  assert(hasDmarc, "DMARC record exists", dmarcRecords.map(({ name, record }) => `${name}: ${record}`).join(" | "));

  const siteCname = await resolveOrEmpty("CNAME", siteSubdomain);
  const pointsToGithubPages = siteCname.some((record) => /github\.io\.?$/i.test(record));
  if (siteCname.length === 0) {
    warn("site custom domain CNAME missing", `${siteSubdomain} is optional unless you bind GitHub Pages to your own domain`);
  } else {
    assert(pointsToGithubPages, "site custom domain points to GitHub Pages", siteCname.join(", "));
  }

  console.log("\nDNS records seen:");
  console.log(JSON.stringify({ apexNs, apexA, apexAaaa, mailTxt, mailMx, mailCname, dmarcRecords, siteCname }, null, 2));
}

if (failures.length > 0) {
  console.error(`\nMail DNS verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log("\nMail DNS verification passed.");
