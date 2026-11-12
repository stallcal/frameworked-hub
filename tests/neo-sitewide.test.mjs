import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const base = readFileSync("layouts/_default/baseof.html", "utf8");
const css = readFileSync("assets/css/neo-sitewide-extensions.css", "utf8");
const resource = readFileSync("layouts/explore/list.html", "utf8");
const home = readFileSync("layouts/index.html", "utf8");
const articles = readFileSync("layouts/_default/list.html", "utf8");
const tools = readFileSync("layouts/tools/list.html", "utf8");
const singles = readFileSync("layouts/_default/single.html", "utf8");
test("new shared extension stylesheet loads after the existing scope styles", () => {
  const neo = base.indexOf('css/neobrutalism.css');
  const header = base.indexOf('css/header-neo-refresh.css');
  const homepage = base.indexOf('css/home-neo-refresh.css');
  const extension = base.indexOf('css/neo-sitewide-extensions.css');
  assert.ok(neo > 0 && header > neo && homepage > header && extension > homepage);
  assert.equal(base.match(/neo-sitewide-extensions.css/g)?.length, 1);
});
test("new neobrutalist rules target existing surfaces without blanket figure/plot styling", () => {
  for (const target of [
    ".tools-page .tools-intro", ".explore-layout .explore-destination",
    ".explore-layout .topic-card", ".resource-library .resource-filters",
    ".resource-library .resource-entry", ".reading-list .reading-row",
    ".home-section .reading-row", ".collection-section .series-card",
    ".article .article-aside", ".site-footer"
  ]) assert.ok(css.includes(target), "Missing "+target);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:canvas|svg|\.prose|\.atlas-page)\s*\{/);
  for (const target of [
    'class="explore-destination"', 'class="topic-card"',
    'class="resource-filters"', 'class="resource-entry"'
  ]) assert.ok(resource.includes(target));
  assert.match(home, /class="home-section"/);
  assert.match(articles, /class="reading-list"/);
  assert.match(tools, /class="tools-intro"/);
  assert.match(singles, /class="article-aside"/);
});
test("mobile, keyboard, motion and high contrast support are present", () => {
  assert.match(css, /max-width: 560px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
});
