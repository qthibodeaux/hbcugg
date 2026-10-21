#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * DEMO DEPLOY — publish build/ to the repo's gh-pages branch.
 *
 * The `gh-pages` package fails on Windows here (spawn ENAMETOOLONG: it hands
 * `git rm` every file path in one command line). This does the same job with
 * plain git and no long argument lists: a one-commit orphan branch made from
 * build/, force-pushed to origin/gh-pages. The branch carries no history.
 *
 *   npm run build:demo     first
 *   npm run deploy:demo
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "build");

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();

if (!fs.existsSync(path.join(BUILD, "index.html"))) {
  console.error("build/index.html not found — run `npm run build:demo` first.");
  process.exit(1);
}

const remote = git(["config", "--get", "remote.origin.url"], ROOT);
const name = git(["config", "--get", "user.name"], ROOT);
const email = git(["config", "--get", "user.email"], ROOT);
if (!fs.existsSync(path.join(BUILD, ".nojekyll"))) fs.writeFileSync(path.join(BUILD, ".nojekyll"), "");

// Fresh repo inside build/ every time (the build step wipes build/ anyway).
fs.rmSync(path.join(BUILD, ".git"), { recursive: true, force: true });
git(["init", "-q", "-b", "gh-pages"], BUILD);
git(["add", "-A"], BUILD);
git(["-c", `user.name=${name}`, "-c", `user.email=${email}`, "commit", "-q", "-m", `Demo build ${new Date().toISOString()}`], BUILD);
console.log(`pushing build/ to ${remote} gh-pages …`);
git(["push", "--force", remote, "gh-pages"], BUILD);
console.log("done — https://qthibodeaux.github.io/hbcugg/ (Pages can take a minute or two)");
