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

test("About page uses the dedicated scoped design without losing source content", () => {
  const about = readFileSync("layouts/about/single.html", "utf8");
  const aboutCss = readFileSync("assets/css/about-neo-refresh.css", "utf8");
  const aboutSource = readFileSync("site-content/about/index.md", "utf8");
  assert.match(aboutSource, /isAbout: true/);
  assert.match(about, /define "main"/);
  assert.match(about, /class="fw-about"/);
  assert.match(about, /\{\{ \.Content \}\}/);
  assert.match(about, /fw-about-next-links/);
  assert.match(about, /relURL/);
  assert.match(base, /if \.Params\.isAbout/);
  assert.match(base, /css\/about-neo-refresh\.css/);
  assert.match(aboutCss, /\.fw-about-hero/);
  assert.match(aboutCss, /\.fw-about-content/);
  assert.match(aboutCss, /focus-visible/);
  assert.match(aboutCss, /prefers-reduced-motion: reduce/);
  assert.match(aboutCss, /max-width: 560px/);
  assert.doesNotMatch(aboutCss, /(?:^|\n)\s*(?:\.home|\.tools-page|\.article-body|\.atlas-page)\s*\{/);
});

test("global spacing and inset footer polish preserve page layout and metadata",()=>{
  const polish = readFileSync("assets/css/layout-spacing-polish.css","utf8");
  const config = readFileSync("config.yml","utf8");
  assert.match(base, /css\/layout-spacing-polish\.css/);
  assert.ok(base.indexOf("css/layout-spacing-polish.css") > base.indexOf("css/about-neo-refresh.css"));
  assert.match(base, /class="footer-meta"/);
  assert.match(base, /class="footer-version"/);
  assert.match(base, /class="footer-back-top"/);
  assert.match(base, /site\.Params\.uiVersion/);
  assert.match(config, /uiVersion: "0\.1\.1"/);
  assert.match(polish, /\.interior \.fw-reading-room-hero/);
  assert.match(polish, /\.about-page \.fw-about-hero/);
  assert.match(polish, /\.tools-page \.tools-intro/);
  assert.match(polish, /\.interior \.explore-layout/);
  assert.match(polish, /\.site-shell > \.site-footer/);
  assert.match(polish, /padding: clamp\(34px, 4vw, 55px\)/);
  assert.match(polish, /@media \(max-width: 620px\)/);
  assert.doesNotMatch(polish, /(?:^|\n)\s*(?:canvas|\.molecular-art|\.atlas-page)\s*\{/);
});

test("Science Resources styling is isolated, legible and reachable from topic links", () => {
  const libraryCss = readFileSync("assets/css/resource-library-refresh.css", "utf8");
  const libraryJs = readFileSync("static/js/resource-library.js", "utf8");
  const contentFile = readFileSync("site-content/explore/resources/_index.md", "utf8");
  assert.match(contentFile, /isResourceLibrary: true/);
  assert.match(base, /if \.Params\.isResourceLibrary/);
  assert.match(base, /css\/resource-library-refresh\.css/);
  assert.ok(
    base.indexOf("css/resource-library-refresh.css") > base.indexOf("css/layout-spacing-polish.css"),
    "Resource Library overrides should load after shared styles"
  );
  assert.match(resource, /class="explore-lead fw-resource-hero"/);
  assert.match(resource, /class="fw-resource-summary"/);
  assert.match(resource, /len \$catalog\.resources/);
  assert.match(resource, /len \$catalog\.topics/);
  assert.match(resource, /len \$catalog\.kinds/);
  assert.match(resource, /range \$catalog\.topics/);
  assert.match(resource, /topic=%s#all-resources-heading/);
  assert.match(resource, /id="resource-search"/);
  assert.match(resource, /id="resource-topic"/);
  assert.match(resource, /id="resource-kind"/);
  assert.match(resource, /data-resource-entry/);
  assert.match(libraryJs, /window\.location\.hash/);
  for (const selector of [
    ".resource-library .fw-resource-hero",
    ".resource-library .resource-filters label",
    ".resource-library .resource-entry-description",
    ".resource-library .resource-entry-meta",
    ".resource-library .resource-topic-help",
    ".resource-library .resource-empty[hidden]"
  ]) assert.ok(libraryCss.includes(selector), "Missing readable library style: " + selector);
  assert.match(libraryCss, /font: 400 18px\/1\.55/);
  assert.match(libraryCss, /font: 700 13px\/1\.4/);
  assert.match(libraryCss, /focus-visible/);
  assert.match(libraryCss, /max-width: 620px/);
  assert.match(libraryCss, /forced-colors: active/);
  assert.doesNotMatch(libraryCss, /(?:^|\n)\s*(?:canvas|\.article-body|\.atlas-page|\.home)\s*\{/);
});
