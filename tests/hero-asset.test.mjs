import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";

const home = readFileSync("layouts/index.html", "utf8");
const base = readFileSync("layouts/_default/baseof.html", "utf8");
const css = readFileSync("assets/css/home-neo-refresh.css", "utf8");
const mark = readFileSync("static/images/frameworked-mark.png");
const assetMark = readFileSync("assets/images/frameworked-mark.png");
const hero = readFileSync("static/images/frameworked-hero-png.png");
const bragg = readFileSync("static/tools/bragg/index.html", "utf8");
const scherrer = readFileSync("static/tools/scherrer/index.html", "utf8");

function isTransparentPng(data) {
  const png = data.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
  const colorType = data[25];
  return png && ([4, 6].includes(colorType) || data.includes(Buffer.from("tRNS")));
}

test("Homepage displays transparent raster artwork, not white-backed WebP or traced SVG", () => {
  assert.match(home, /frameworked-hero-png\.png/);
  assert.doesNotMatch(home, /frameworked-logo\.webp|frameworked-hero-vector\.svg/);
  assert.ok(isTransparentPng(hero), "Hero image needs actual alpha transparency");
  assert.equal(hero.readUInt32BE(16), 360);
  assert.equal(hero.readUInt32BE(20), 500);
  assert.match(css, /filter: none/);
});

test("Header, favicon, touch icon and standalone tools use transparent artwork", () => {
  assert.ok(isTransparentPng(mark));
  assert.deepEqual(mark, assetMark);
  assert.match(base, /resources.Get "images\/frameworked-mark\.png"/);
  assert.match(base, /"32x png"/);
  assert.match(base, /"96x png"/);
  assert.match(base, /"180x png"/);
  assert.match(base, /rel="apple-touch-icon"/);
  assert.match(bragg, /src="\/images\/frameworked-mark\.png"/);
  assert.match(scherrer, /src="\/images\/frameworked-mark\.png"/);
});

test("High-resolution transparent logo is opt-in with safe existing PNG fallback", () => {
  assert.match(base, /resources.Get "images\/frameworked-logo-hd\.png"/);
  assert.match(home, /resources.Get "images\/frameworked-logo-hd\.png"/);
  assert.match(home, /width="1024" height="1024"/);
  assert.match(home, /frameworked-hero-png\.png/);
  const hdPath = "assets/images/frameworked-logo-hd.png";
  if (existsSync(hdPath)) {
    const hd = readFileSync(hdPath);
    assert.ok(isTransparentPng(hd), "High-resolution source must preserve actual alpha transparency");
    assert.ok(hd.readUInt32BE(16) >= 1024 && hd.readUInt32BE(20) >= 1024);
  }
});
