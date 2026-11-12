import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const base = readFileSync("layouts/_default/baseof.html", "utf8");
const home = readFileSync("layouts/index.html", "utf8");
const headerCss = readFileSync("assets/css/header-neo-refresh.css", "utf8");
const homeCss = readFileSync("assets/css/home-neo-refresh.css", "utf8");
test("new header exposes desktop and native mobile navigation",()=>{
  assert.match(base, /class="site-header fw-design-header"/);
  assert.match(base, /class="fw-primary-nav" aria-label="Main navigation"/);
  assert.match(base, /<details class="fw-mobile-menu">/);
  assert.match(base, /aria-label="Mobile navigation"/);
  for (const path of ["/", "/articles/", "/tools/", "/explore/", "/about/"])
    assert.equal(base.split('href="{{ "'+path+'" | relURL }}"').length - 1 >= 2, true, path+" exists in both menus");
  assert.match(headerCss, /@media \(max-width: 900px\)/);
  assert.match(headerCss, /summary:focus-visible/);
});
test("homepage keeps main heading, reading sections and working science-tool routes",()=>{
  assert.match(home, /id="hero-title"/);
  assert.match(home, /Featured explorers/);
  assert.match(home, /Explore by topic/);
  assert.match(home, /"\/tools\/bragg\/"/);
  assert.match(home, /"\/tools\/node-and-linker\/"/);
  assert.match(home, /"\/tools\/normal-modes\/"/);
  assert.match(home, /"\/tools\/reagent-ratios\/"/);
  assert.match(home, /"\/articles\/pfas-groundwater\/"/);
  assert.match(home, /\{\{ \$published :=/);
  assert.match(home, /Featured <em>story/);
});
test("wave-interference feature is shown only when the route exists",()=>{
  assert.match(home, /if fileExists "static\/tools\/wave-interference\/index.html"/);
  assert.match(home, /"\/tools\/wave-interference\/"/);
  assert.match(home, /"\/tools\/normal-modes\/"/);
});
test("design remains scoped, responsive and reduced-motion accessible",()=>{
  assert.match(base, /"css\/header-neo-refresh.css"/);
  assert.match(base, /if \.IsHome/);
  assert.match(base, /"css\/home-neo-refresh.css"/);
  assert.match(homeCss, /@media\(max-width:560px\)/);
  assert.match(homeCss, /prefers-reduced-motion:reduce/);
  assert.match(homeCss, /focus-visible/);
  assert.doesNotMatch(home, /https?:\/\//);
});
