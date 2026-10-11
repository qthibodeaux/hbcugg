#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * DEMO BUILD — serve from a sub-path (a GitHub Pages project site,
 * https://<user>.github.io/hbcugg/).
 *
 * The app and its data refer to public/ files by root-absolute paths
 * ("/data/...", "/assets/...", "/pics/...", "/stadiums/..."). Under /hbcugg/
 * every one of them would 404. Runs after `react-scripts build` in
 * `npm run build:demo`, and prefixes those paths in the build output only —
 * source files and public/ are never touched, so no page needs a path helper.
 *
 *   node scripts/rebase_demo_build.js              prefix from $PUBLIC_URL (default /hbcugg)
 *   node scripts/rebase_demo_build.js --dry        report only
 *
 * Rewrites, in build/ (js, css, html) and build/data (json):
 *   "/data/…"  '/assets/…'  `/pics/…`  url('/stadiums/…')  →  same with the prefix.
 * Idempotent: an already-prefixed path no longer starts with /data|assets|pics|stadiums.
 */
const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry");
const PREFIX = (process.env.PUBLIC_URL || "/hbcugg").replace(/\/+$/, "");
const BUILD = path.resolve(__dirname, "..", "build");

// A quote, backtick or "(" immediately before the path marks it as a URL string.
const RE = /(["'`(])\/(data|assets|pics|stadiums)\//g;
const EXT = new Set([".js", ".css", ".html", ".json"]);

let files = 0;
let changed = 0;
let hits = 0;

const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (EXT.has(path.extname(e.name).toLowerCase())) rewrite(full);
  }
};

const rewrite = (file) => {
  files += 1;
  const src = fs.readFileSync(file, "utf8");
  let n = 0;
  const out = src.replace(RE, (_, q, dir) => { n += 1; return `${q}${PREFIX}/${dir}/`; });
  if (!n) return;
  hits += n;
  changed += 1;
  if (!DRY) fs.writeFileSync(file, out, "utf8");
};

if (!fs.existsSync(BUILD)) {
  console.error("build/ not found — run react-scripts build first.");
  process.exit(1);
}
walk(BUILD);
console.log(`${DRY ? "[dry] " : ""}rebased to ${PREFIX}: ${hits} paths in ${changed} of ${files} files`);
