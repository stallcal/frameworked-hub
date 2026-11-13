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
  assert.match(config, /uiVersion: "0\.1\.4"/);
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

test("Science Resources catalog retains stable IDs, unique URLs and valid topical filters", () => {
  const data = JSON.parse(readFileSync("data/science_resources.json", "utf8"));
  const topics = new Set(data.topics.map(t => t.id));
  const kinds = new Set(data.kinds.map(k => k.id));
  const ids = new Set();
  const urls = new Set();
  for (const resource of data.resources) {
    assert.ok(typeof resource.id === "string" && resource.id.length > 0);
    assert.ok(!ids.has(resource.id), "Duplicate resource ID: " + resource.id);
    ids.add(resource.id);
    assert.ok(kinds.has(resource.kind), "Unknown resource kind: " + resource.id);
    assert.ok(Array.isArray(resource.topics) && resource.topics.length > 0);
    for (const topic of resource.topics) assert.ok(topics.has(topic), "Unknown topic: " + topic);
    assert.ok(typeof resource.title === "string" && resource.title.trim());
    const link = resource.doi ? "https://doi.org/" + resource.doi : resource.url;
    assert.ok(typeof link === "string" && /^https:\/\/[^\s]+$/.test(link), "Invalid URL: " + resource.id);
    const normalized = link.toLowerCase().replace(/\/$/, "");
    assert.ok(!urls.has(normalized), "Duplicate link: " + resource.id);
    urls.add(normalized);
  }
  for (const topic of ["mathematics", "engineering", "space"]) {
    assert.ok(topics.has(topic), "Missing requested STEM topic " + topic);
  }
  assert.ok(kinds.has("podcasts"));
  assert.ok(data.resources.length >= 92);
  for (const requested of [
    "symotter", "crystals-otterbein", "mof-anatomy", "wriedt-lab-home",
    "nasa", "nasa-science", "nasa-jpl", "nasa-goddard", "nasa-johnson",
    "jantec-engineering", "professor-derricotte", "the-rest-is-science",
    "three-blue-one-brown", "the-rest-is-science-podcast", "episodic-table",
    "chemicalforce", "prussian-blue", "chads-prep", "acs-reactions", "ut-dallas"
  ]) assert.ok(ids.has(requested), "Missing vetted requested source " + requested);
  const page = readFileSync("layouts/explore/list.html", "utf8");
  assert.match(page, /range \$catalog\.topics/);
  assert.match(page, /range \$catalog\.kinds/);
  assert.match(page, /data-resource-entry/);
  assert.match(page, /len \$catalog\.resources/);
});

test("Basic neobrutalist YouTube avatars use valid sources and resilient lazy fallback", () => {
  const data = JSON.parse(readFileSync("data/science_resources.json", "utf8"));
  const page = readFileSync("layouts/explore/list.html", "utf8");
  const css = readFileSync("assets/css/resource-library-refresh.css", "utf8");
  const js = readFileSync("static/js/resource-library.js", "utf8");

  const channels = data.resources.filter(x => x.kind === "channels");
  assert.equal(channels.length, 37);
  for (const item of channels) {
    const handle = item.url.match(/^https:\/\/(?:www\.)?youtube\.com\/(?:@([^/?#]+)|channel\/(UC[\w-]+))/);
    assert.ok(handle, "Invalid channel identity: " + item.id);
    const expected = handle[1]
      ? "https://avatarsapi.com/youtube/@" + handle[1] + "?size=112"
      : "https://banner.yt/" + handle[2] + "?type=avatar&width=112&height=112";
    assert.equal(item.avatar, expected, "Avatar source differs from channel identity: " + item.id);
  }
  for (const item of data.resources.filter(x => x.kind !== "channels"))
    assert.equal(item.avatar, undefined, "Unexpected avatar on nonchannel entry " + item.id);

  assert.match(page, /if eq \.kind "channels"/);
  assert.match(page, /class="resource-avatar"/);
  assert.match(page, /class="resource-avatar-fallback"/);
  assert.match(page, /class="resource-avatar-image"/);
  assert.match(page, /loading="lazy"/);
  assert.match(page, /decoding="async"/);
  assert.match(page, /referrerpolicy="no-referrer"/);
  assert.match(page, /Avatars by|avatar lookups are powered by/);
  assert.match(page, /avatarsapi\\.com/);
  assert.match(page, /banner\\.yt/);
  assert.match(css, /\.resource-library \.resource-entry-with-avatar/);
  assert.match(css, /border-radius: 50%/);
  assert.match(css, /\.resource-avatar\.is-loaded \.resource-avatar-image/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(js, /img\.addEventListener\('error', failed/);
  assert.match(js, /img\.addEventListener\('load', loaded/);
  assert.match(js, /img\.complete && img\.naturalWidth > 0/);
  assert.match(js, /\bupdate\(\);/);
});
