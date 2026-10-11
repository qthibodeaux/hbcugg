#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * DEMO BUILD — trim build/data to the 2026 season.
 *
 * Runs after `react-scripts build` in `npm run build:demo`. CRA copies all of
 * public/ into build/; this deletes, from build/data only, what the 2026 demo
 * never reads. public/data is never touched.
 *
 *   node scripts/prune_demo_build.js            prune build/data
 *   node scripts/prune_demo_build.js --dry      report only, delete nothing
 *   node scripts/prune_demo_build.js --dry --dir public/data   estimate on the source
 *
 * Dropped:
 *   - any path naming a season 2015–2024 (folder or file name)
 *   - 2025 game-center data (93-FE Docs/game-center, 1-game center): the demo's
 *     season pickers offer 2026 only
 *   - scratch: TEST/, tools/, responses/, and loose .md / .py at the data root
 * Kept regardless: multi-season files the pages read by name (KEEP below), and
 * every undated file (teams, logos, coaches, officials, stadiums).
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const dirArg = args.includes("--dir") ? args[args.indexOf("--dir") + 1] : "build/data";
const ROOT = path.resolve(__dirname, "..", dirArg);

const OLD_SEASON = /(^|[^0-9])20(1[5-9]|2[0-4])([^0-9]|$)/;
const KEEP = [/2021_2025/, /all_years/i];
const SCRATCH_DIRS = new Set(["TEST", "tools", "responses"]);

const drop = (rel) => {
  const parts = rel.split("/");
  if (SCRATCH_DIRS.has(parts[0])) return true;
  if (parts.length === 1 && /\.(md|py)$/i.test(rel)) return true;
  if (KEEP.some((re) => re.test(rel))) return false;
  if (OLD_SEASON.test(rel)) return true;
  const gameCenter = rel.startsWith("93-FE Docs/game-center/") || rel.startsWith("1-game center/");
  if (gameCenter && /(^|[^0-9])2025([^0-9]|$)/.test(rel)) return true;
  return false;
};

if (!fs.existsSync(ROOT)) {
  console.error(`No folder at ${ROOT}. Run the build first.`);
  process.exit(1);
}

let kept = 0, dropped = 0, keptBytes = 0, droppedBytes = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
      if (!DRY && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
      continue;
    }
    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    const size = fs.statSync(full).size;
    if (drop(rel)) {
      dropped++; droppedBytes += size;
      if (!DRY) fs.unlinkSync(full);
    } else {
      kept++; keptBytes += size;
    }
  }
};
walk(ROOT);

// GitHub Pages runs Jekyll by default, which drops paths starting with "_".
if (!DRY && dirArg === "build/data") fs.writeFileSync(path.resolve(ROOT, "..", ".nojekyll"), "");

const mb = (b) => `${(b / 1048576).toFixed(1)} MB`;
console.log(`${DRY ? "[dry run] " : ""}${dirArg}: kept ${kept} files (${mb(keptBytes)}), ${DRY ? "would drop" : "dropped"} ${dropped} (${mb(droppedBytes)})`);
if (keptBytes > 900 * 1048576) console.warn("Warning: over 900 MB — GitHub Pages caps a site at 1 GB.");
