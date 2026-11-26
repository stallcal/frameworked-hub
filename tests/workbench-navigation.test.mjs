import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const catalogPath = "data/workbench.json";
const expectedGroups = {
  materials: ["/tools/node-and-linker/", "/tools/pore-access/"],
  adsorption: ["/tools/isotherm-shapes/", "/tools/langmuir-isotherm/", "/tools/partial-pressure/", "/tools/methane-storage/"],
  crystallography: ["/tools/bragg/", "/tools/scherrer/"],
  spectroscopy: ["/tools/normal-modes/", "/tools/molecular-vibration/", "/tools/beer-lambert/"],
  practical: ["/tools/reagent-ratios/"],
};
const expectedQuantum = [
  "/tools/franck-condon/", "/tools/orbital-mixing/", "/tools/particle-in-a-box/",
  "/tools/wave-superposition/", "/tools/thermal-populations/",
];

test("workbench groups all 17 canonical tools without mixing quantum models into the primary directory", () => {
  assert.ok(existsSync(catalogPath), "data/workbench.json must exist");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  assert.deepEqual(catalog.groups.map(group => group.id), Object.keys(expectedGroups));

  const actualPrimary = catalog.groups.flatMap(group => group.tools.map(tool => tool.url));
  const actualQuantum = catalog.quantum.tools.map(tool => tool.url);
  for (const group of catalog.groups) {
    assert.ok(group.title && group.description, `${group.id} needs user-facing context`);
    assert.deepEqual(group.tools.map(tool => tool.url), expectedGroups[group.id]);
  }
  assert.deepEqual(actualQuantum, expectedQuantum);
  assert.equal(actualPrimary.length, 12);
  assert.equal(actualQuantum.length, 5);
  assert.equal(new Set([...actualPrimary, ...actualQuantum]).size, 17, "every canonical URL must appear exactly once");
  assert.ok(actualPrimary.every(url => !actualQuantum.includes(url)));
});

test("rendered workbench links directly to the twelve primary tools and a separate quantum collection", t => {
  const mainPath = "public-production/tools/index.html";
  if (!existsSync(mainPath)) return t.skip("Build production Hugo output before this integration check");
  const main = readFileSync(mainPath, "utf8");
  const quantumPath = "public-production/tools/quantum/index.html";
  assert.ok(existsSync(quantumPath), "quantum collection should have a real rendered page");
  const quantum = readFileSync(quantumPath, "utf8");

  for (const id of Object.keys(expectedGroups)) {
    assert.match(main, new RegExp(`id="${id}"`), `${id} is a working homepage anchor`);
  }
  const linkedTools = html => [...html.matchAll(/class="chapter-link" href="(\/tools\/[^"#?]+\/)">/g)].map(match => match[1]);
  assert.deepEqual(linkedTools(main), Object.values(expectedGroups).flat(), "main cards should contain only the primary tools");
  assert.deepEqual(linkedTools(quantum), expectedQuantum, "secondary cards should contain only the five early models");
  assert.match(main, /href="\/tools\/quantum\/"/, "main workbench links once to quantum collection");
  assert.match(quantum, /href="\/tools\/"/, "quantum collection links back to main workbench");
  assert.match(quantum, /class="tools-intro quantum-intro"/, "secondary collection should use a more compact introduction");

  for (const url of [...Object.values(expectedGroups).flat(), ...expectedQuantum]) {
    assert.ok(existsSync(`public-production${url}index.html`), `existing canonical tool route must survive: ${url}`);
  }
});

test("every explorer has one or two curated, published, non-self next steps", () => {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const allTools = [...catalog.groups.flatMap(group => group.tools.map(tool => tool.url)), ...catalog.quantum.tools.map(tool => tool.url)];
  const relations = JSON.parse(readFileSync("data/tool_relations.json", "utf8"));
  assert.deepEqual(Object.keys(relations).sort(), [...allTools].sort(), "each canonical tool needs a curated route");
  for (const [source, links] of Object.entries(relations)) {
    assert.ok(links.length >= 1 && links.length <= 2, `${source}: one or two meaningful follow-ups`);
    for (const link of links) {
      assert.ok(link.title && link.description, `${source}: explain each next step`);
      assert.notEqual(link.url, source, `${source}: no self-referential link`);
      assert.ok(link.url.startsWith("/tools/"), `${source}: link to a published tool or collection`);
      assert.ok(allTools.includes(link.url) || link.url === "/tools/quantum/" || link.url.startsWith("/tools/#"), `${source}: target must be a published tool or collection`);
      assert.doesNotMatch(link.url, /draft|pfas-groundwater/, `${source}: no unpublished destinations`);
    }
  }
});

test("rendered explorer pages provide curated routes and consistent header navigation", t => {
  const dir = "public-production";
  if (!existsSync(`${dir}/tools/normal-modes/index.html`)) return t.skip("Build production Hugo output first");
  const relations = JSON.parse(readFileSync("data/tool_relations.json", "utf8"));
  for (const [source, links] of Object.entries(relations)) {
    const html = readFileSync(`${dir}${source}index.html`, "utf8");
    const nav = html.match(/<nav class="tool-related(?: [^"]+)?"[\s\S]*?<\/nav>/);
    assert.ok(nav, `${source} needs a labeled next-step block`);
    assert.match(nav[0], /aria-label="Continue exploring"/);
    assert.match(nav[0], /class="tool-related-arrow"[^>]*><svg/, `${source} needs a reliable vector arrow`);
    for (const link of links) assert.ok(nav[0].includes(`href="${link.url}"`), `${source} must link to ${link.url}`);
    assert.doesNotMatch(nav[0], /href="\/articles\/|href="\/tools\/franck-condon\/".*href="\/tools\/orbital-mixing\//);
  }
  for (const source of ["/tools/bragg/", "/tools/scherrer/", "/tools/reagent-ratios/"]) {
    const html = readFileSync(`${dir}${source}index.html`, "utf8");
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
    for (const link of ["/", "/tools/", "/explore/", "/about/"]) {
      assert.ok(header.includes(`href="${link}"`), `${source}: header should include ${link}`);
    }
    assert.ok(!header.includes('href="/articles/"'), `${source}: Articles belongs in the footer`);
  }
  const standaloneCss = readFileSync("static/css/frameworked-tool-related.css", "utf8");
  assert.match(standaloneCss, /\.tool-related\.shell\s*\{[^}]*margin:\s*52px auto/, "standalone calculator panel must stay within centered content shell");
});
