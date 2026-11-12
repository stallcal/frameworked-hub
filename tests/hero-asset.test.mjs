import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const home = readFileSync("layouts/index.html", "utf8");
const base = readFileSync("layouts/_default/baseof.html", "utf8");
const css = readFileSync("assets/css/home-neo-refresh.css", "utf8");
const mark = readFileSync("static/images/frameworked-logo.webp");
const assetMark = readFileSync("assets/images/frameworked-logo.webp");
const bragg = readFileSync("static/tools/bragg/index.html", "utf8");
const scherrer = readFileSync("static/tools/scherrer/index.html", "utf8");

test("Homepage uses owner-uploaded raster logo, not a traced SVG or the old preview", () => {
  assert.match(home, /frameworked-logo\.webp/);
  assert.doesNotMatch(home, /frameworked-hero-vector\.svg|frameworked-hero-png\.png/);
  assert.equal(mark.toString("ascii", 0, 4), "RIFF");
  assert.equal(mark.toString("ascii", 8, 12), "WEBP");
  assert.deepEqual(mark, assetMark);
  assert.ok(mark.length > 7000 && mark.length < 40000);
  assert.match(css, /filter: none/);
});

test("Header, favicon, Apple touch and standalone tools share the uploaded brand", () => {
  assert.match(base, /resources.Get "images\/frameworked-logo\.webp"/);
  assert.match(base, /"32x png"/);
  assert.match(base, /"96x png"/);
  assert.match(base, /"180x png"/);
  assert.match(base, /rel="apple-touch-icon"/);
  assert.match(bragg, /src="\/images\/frameworked-logo\.webp"/);
  assert.match(scherrer, /src="\/images\/frameworked-logo\.webp"/);
});
