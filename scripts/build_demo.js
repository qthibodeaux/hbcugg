#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * DEMO BUILD — `npm run build:demo`, as one script that is never silent.
 *
 * The old script chained five commands with `&&`. When the compile died or sat
 * for minutes, the terminal showed nothing, and a stopped build looked the same
 * as a running one. This runs the same steps in the same order and:
 *   - prints a numbered banner for every step, and a heartbeat every 30 s while
 *     a long step runs ("still running, 3m 30s") so a stall is visible;
 *   - says plainly when a step fails: its exit code or signal, and a hint when
 *     the output shows the compiler ran out of memory;
 *   - keeps everything in build.log (git ignores it);
 *   - checks build/ at the end and only then says it is ready to deploy.
 *
 *   1 sync    scripts/sync_fe_docs.js     backend folder -> public/data/93-FE Docs
 *   2 compile react-scripts build         REACT_APP_DEMO=1, PUBLIC_URL=/hbcugg
 *   3 prune   scripts/prune_demo_build.js 2026 data only
 *   4 rebase  scripts/rebase_demo_build.js /data, /assets... -> /hbcugg/...
 *   5 check   build/index.html and the bundle exist
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LOG = fs.createWriteStream(path.join(ROOT, "build.log"));
const HEARTBEAT_MS = 30000;
const T0 = Date.now();

const clock = (ms) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
};
const say = (msg) => {
  const line = `[build:demo ${clock(Date.now() - T0)}] ${msg}`;
  console.log(line);
  LOG.write(`${line}\n`);
};

const run = (label, args, extraEnv = {}) =>
  new Promise((resolve) => {
    say(`${label} …`);
    const started = Date.now();
    let outOfMemory = false;
    // node itself, no shell: nothing for Windows quoting to swallow.
    const child = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    const beat = setInterval(() => say(`${label} still running (${clock(Date.now() - started)})`), HEARTBEAT_MS);
    const pipe = (stream, sink) =>
      stream.on("data", (d) => {
        sink.write(d);
        LOG.write(d);
        if (/heap out of memory|JavaScript heap|FATAL ERROR/i.test(String(d))) outOfMemory = true;
      });
    pipe(child.stdout, process.stdout);
    pipe(child.stderr, process.stderr);
    child.on("error", (e) => {
      clearInterval(beat);
      say(`${label} could not start: ${e.message}`);
      resolve(false);
    });
    child.on("exit", (code, signal) => {
      clearInterval(beat);
      if (code === 0) {
        say(`${label} done in ${clock(Date.now() - started)}`);
        return resolve(true);
      }
      say(`${label} FAILED (${signal ? `signal ${signal}` : `exit code ${code}`}) after ${clock(Date.now() - started)}`);
      if (outOfMemory || code === 134) say("The compiler ran out of memory. Raise --max-old-space-size in scripts/build_demo.js (currently 4096) and run again.");
      resolve(false);
    });
  });

const fail = (why) => {
  say(`STOPPED — ${why}`);
  say("Full output is in build.log. Do not run deploy:demo.");
  process.exitCode = 1;
};

(async () => {
  say("starting");
  if (/onedrive/i.test(ROOT)) say("note: this project is inside OneDrive. If a step stalls or fails, pause OneDrive syncing (tray icon > Pause syncing) and run again.");
  process.on("SIGINT", () => {
    say("INTERRUPTED (Ctrl+C) — the build is incomplete. Do not run deploy:demo.");
    process.exit(130);
  });

  if (!(await run("1/4 sync backend data", ["scripts/sync_fe_docs.js"]))) return fail("data sync failed");

  const reactScripts = require.resolve("react-scripts/bin/react-scripts.js");
  const compileEnv = { REACT_APP_DEMO: "1", PUBLIC_URL: "/hbcugg", NODE_OPTIONS: "--max-old-space-size=4096" };
  if (!(await run("2/4 compile (several minutes, quiet until it finishes)", [reactScripts, "build"], compileEnv))) return fail("compile failed");

  if (!(await run("3/4 prune data to 2026", ["scripts/prune_demo_build.js"]))) return fail("prune failed");
  if (!(await run("4/4 rebase paths to /hbcugg", ["scripts/rebase_demo_build.js"], { PUBLIC_URL: "/hbcugg" }))) return fail("rebase failed");

  const built = fs.existsSync(path.join(ROOT, "build", "index.html")) && fs.existsSync(path.join(ROOT, "build", "static", "js"));
  if (!built) return fail("build/ has no index.html or static/js");
  say(`READY — build is complete (${clock(Date.now() - T0)}). Now run: npm run deploy:demo`);
})();
