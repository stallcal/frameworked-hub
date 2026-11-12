import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync("layouts/_default/list.html","utf8");
const base=readFileSync("layouts/_default/baseof.html","utf8");
const css=readFileSync("assets/css/articles-neo-refresh.css","utf8");
test("Articles gets scoped masthead, existing reading streams remain intact",()=>{
  assert.match(page, /if \$isArticles[\s\S]*class="fw-reading-room"/);
  assert.match(page, /id="reading-title"/);
  assert.match(page, /id="fw-stories"/);
  assert.match(page, /partial "series-cards.html"/);
  assert.match(page, /partial "content-card.html"/);
  assert.match(page, /where \$readings "Draft" false/);
  assert.match(page, /fw-reading-room-empty/);
  assert.match(page, /In review/);
  assert.match(page, /class="page-heading"/);
});
test("Articles stylesheet is only included for article sections",()=>{
  assert.match(base, /if and \(eq \.Section "articles"\) \(eq \.Kind "section"\)/);
  assert.match(base, /css\/articles-neo-refresh.css/);
  assert.match(css, /\.fw-reading-room-hero/);
  assert.match(css, /\.fw-reading-room-list/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /focus-visible/);
});
