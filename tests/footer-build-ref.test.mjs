import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = readFileSync("layouts/_default/baseof.html", "utf8");
const config = readFileSync("config.yml", "utf8");

test("existing manual UI version remains unchanged", () => {
  assert.match(config, /uiVersion: "0\.1\.4"/);
  assert.match(base, /class="footer-version" aria-label="Interface version"/);
  assert.match(base, /site\.Params\.uiVersion/);
});

test("footer shows a separate, actual deploy commit from Cloudflare's build environment", () => {
  assert.match(base, /os\.Getenv "CF_PAGES_COMMIT_SHA"/);
  assert.match(base, /findRE "\^\[0-9a-fA-F\]\{40\}\$" \$buildSHA/);
  assert.match(base, /Deployed Git commit \{\{ \$buildSHA \}\}/);
  assert.match(base, /https:\/\/github\.com\/stallcal\/frameworked-hub\/commit\/%s/);
  assert.match(base, /ref \{\{ substr \$buildSHA 0 8 \}\}/);
  assert.doesNotMatch(base, /ref [0-9a-f]{8}<\/a>/);
});

test("Hugo environment allowlist is restricted to the needed deployment SHA", () => {
  assert.match(config, /security:\s*\n  funcs:\s*\n    getenv:/);
  for (const expected of ["^HUGO_", "^CI$", "^CF_PAGES_COMMIT_SHA$"]) {
    assert.ok(config.includes('"' + expected + '"'), "Missing allowlisted environment variable: " + expected);
  }
  assert.ok(!config.includes('"^CF_PAGES_"'), "Avoid broad access to Cloudflare variables");
});

test("missing or invalid SHA is visibly unavailable, never represented as a deployed hash", () => {
  assert.match(base, /ref unavailable/);
  assert.match(base, /A deployment commit reference was not provided to this build/);
  assert.match(base, /if findRE/);
  assert.match(base, /\{\{ else \}\}/);
});
