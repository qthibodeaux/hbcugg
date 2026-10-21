/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Dev server only (CRA loads this for `npm start`; builds never see it).
//
// Serves the backend's export folder live, so `/data/93-FE Docs/...` reads
// straight from wherever FE_DOCS_DIR points (set in .env.development.local,
// which git ignores) — re-run the backend export and the next page load has it.
// No FE_DOCS_DIR, or the folder is missing: requests fall through to
// public/data/93-FE Docs as before.
//
// Builds read public/data; `npm run sync:data` copies the folder there first
// (build and build:demo run it for you).
// ─────────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const express = require("express");

module.exports = function setupProxy(app) {
  const dir = process.env.FE_DOCS_DIR;
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    console.warn(`[fe-docs] FE_DOCS_DIR not found: ${dir} — using public/data/93-FE Docs`);
    return;
  }
  // Fresh reads every time: the folder changes under the server.
  const serve = express.static(dir, { fallthrough: true, etag: false, lastModified: false, cacheControl: false });
  // The browser sends the space encoded; register both spellings.
  app.use("/data/93-FE%20Docs", serve);
  app.use("/data/93-FE Docs", serve);
  console.log(`[fe-docs] serving /data/93-FE Docs from ${dir}`);
};
