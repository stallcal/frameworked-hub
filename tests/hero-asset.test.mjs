import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const home=readFileSync("layouts/index.html","utf8");
const css=readFileSync("assets/css/home-neo-refresh.css","utf8");
const png=readFileSync("static/images/frameworked-hero-png.png");
test("Homepage uses owner's original artwork as PNG, never the traced SVG",()=>{
  assert.match(home,/frameworked-hero-png.png/);
  assert.doesNotMatch(home,/frameworked-hero-vector.svg/);
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16),360);
  assert.equal(png.readUInt32BE(20),500);
  assert.ok(png.length>5000 && png.length<100000);
  assert.match(css,/filter: none/);
});
