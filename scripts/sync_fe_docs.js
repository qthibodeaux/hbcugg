#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Copy the backend's export folder into public/data/93-FE Docs.
 *
 * The dev server reads the folder live (src/setupProxy.js); a build reads
 * public/data, so this runs before `npm run build` and `npm run build:demo`.
 *
 *   node scripts/sync_fe_docs.js            mirror FE_DOCS_DIR → public/data/93-FE Docs
 *   node scripts/sync_fe_docs.js --dry      report only
 *
 * FE_DOCS_DIR comes from the environment, else from .env.development.local.
 * Not set → nothing to do (the build uses whatever public/data already holds).
 * The copy is a mirror: files gone from the source are gone from the copy.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEST = path.join(ROOT, "public", "data", "93-FE Docs");
const DRY = process.argv.includes("--dry");

const fromEnvFile = () => {
  const file = path.join(ROOT, ".env.development.local");
  if (!fs.existsSync(file)) return null;
  const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find((l) => /^\s*FE_DOCS_DIR\s*=/.test(l));
  return line ? line.replace(/^\s*FE_DOCS_DIR\s*=\s*/, "").replace(/^["']|["']$/g, "").trim() : null;
};

const SRC = process.env.FE_DOCS_DIR || fromEnvFile();
if (!SRC) {
  console.log("[sync:data] FE_DOCS_DIR not set — keeping public/data/93-FE Docs as is.");
  process.exit(0);
}
if (!fs.existsSync(SRC)) {
  console.error(`[sync:data] FE_DOCS_DIR not found: ${SRC}`);
  process.exit(1);
}

let files = 0;
let bytes = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else { files += 1; bytes += fs.statSync(full).size; }
  }
};
walk(SRC);
const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;

if (DRY) {
  console.log(`[sync:data] [dry run] would mirror ${files} files (${mb(bytes)}) from ${SRC}`);
  process.exit(0);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.cpSync(SRC, DEST, { recursive: true });
console.log(`[sync:data] mirrored ${files} files (${mb(bytes)}) from ${SRC} → public/data/93-FE Docs`);
