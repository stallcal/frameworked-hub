import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const home=readFileSync("layouts/index.html","utf8");
const css=readFileSync("assets/css/home-neo-refresh.css","utf8");
const svg=readFileSync("static/images/frameworked-hero-vector.svg","utf8");
test("Homepage hero uses scalable and proportionate framework art",()=>{
  assert.match(home,/frameworked-hero-vector.svg/);
  assert.doesNotMatch(home,/<img src="\{\{ "\/images\/frameworked-mark.png"/);
  assert.match(css,/max-height: 525px/);
  assert.match(css,/filter: none/);
  assert.match(svg,/viewBox="0 0 1356 1849"/);
  assert.match(svg,/#1C3049/);
  assert.match(svg,/#9E382E/);
});
