import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCubicGraph, projectThreeQuarter, poreAnchor, poreMarkerRadius, sceneExtents, STATES} from '../assets/mof-build/model.mjs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('step labels and model range are explicit and finite', () => {
  assert.equal(STATES.length, 4);
  assert.deepEqual(STATES.map(s => s.label), [
    'Building pieces', '1 × 1 × 1', '2 × 2 × 2', '3 × 3 × 3'
  ]);
  for (const invalid of [0, 4, -1, 0.5, 2.5, NaN, Infinity, '2']) {
    assert.throws(() => buildCubicGraph(invalid), RangeError);
  }
});

test('each cubic segment has deduplicated shared vertices and links', () => {
  for (const n of [1, 2, 3]) {
    const graph = buildCubicGraph(n);
    assert.equal(graph.blocks, n ** 3);
    assert.equal(graph.nodes.length, (n + 1) ** 3);
    assert.equal(graph.edges.length, 3 * n * (n + 1) ** 2);
    const ids = new Set(graph.nodes.map(node => node.id));
    assert.equal(ids.size, graph.nodes.length);
    const edgeIds = new Set();
    for (const edge of graph.edges) {
      assert.ok(ids.has(edge.from));
      assert.ok(ids.has(edge.to));
      assert.notEqual(edge.from, edge.to);
      const id = [edge.from, edge.to].sort().join('|');
      assert.ok(!edgeIds.has(id), 'duplicate edge ' + id);
      edgeIds.add(id);
      const a = edge.a, b = edge.b;
      assert.equal(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z), 1,
        'each schematic link connects adjacent grid vertices');
    }
    const center = poreAnchor(n);
    for (const c of [center.x, center.y, center.z]) {
      assert.ok(c > 0 && c < n);
      assert.equal(c % 1, 0.5);
    }
    assert.equal(center.y, 0.5, 'selected opening should be near the front');
    const scale = 100 / n;
    const markerRadius = poreMarkerRadius(scale);
    assert.ok(markerRadius >= 18 && markerRadius <= 56);
    assert.ok(markerRadius > Math.min(23, scale * 0.16),
      'new marker is larger than the original design');
    const bounds = sceneExtents(graph.nodes);
    assert.ok(bounds.maxX > bounds.minX);
    assert.ok(bounds.maxY > bounds.minY);
    for (const node of graph.nodes) {
      const p = projectThreeQuarter(node);
      assert.ok(Number.isFinite(p.x));
      assert.ok(Number.isFinite(p.y));
    }
  }
});

test('three-quarter view shows a square front plane and angled depth', () => {
  const origin = projectThreeQuarter({x:0,y:0,z:0});
  const right = projectThreeQuarter({x:1,y:0,z:0});
  const up = projectThreeQuarter({x:0,y:0,z:1});
  const depth = projectThreeQuarter({x:0,y:1,z:0});
  assert.equal(right.y, origin.y, 'x axis should be horizontal');
  assert.equal(up.x, origin.x, 'z axis should be vertical');
  assert.ok(right.x > origin.x);
  assert.ok(up.y < origin.y);
  assert.ok(depth.x > origin.x && depth.y < origin.y,
    'y axis should recede diagonally up and right');
  assert.ok(poreMarkerRadius(230) >= 50,
    'single-block highlight should be visibly prominent');
  assert.ok(poreMarkerRadius(78) > 25,
    '3x3x3 highlight should remain visible after fit-to-view');
});

test('Hugo widget is scoped, accessible, with no-JS starting view and independent assets', () => {
  const widget = read('../layouts/shortcodes/mof-build.html');
  const js = read('../assets/mof-build/app.js');
  const css = read('../assets/mof-build/style.css');
  assert.match(widget, /Page\.Scratch\.Get "mofBuildAssetsLoaded"/);
  assert.match(widget, /resources.Get "mof-build\/style.css"/);
  assert.match(widget, /resources.Get "mof-build\/app.js"/);
  assert.match(widget, /js\.Build/);
  assert.match(widget, /data-mof-build/);
  assert.match(widget, /data-build-scene/);
  assert.match(widget, /type="range" min="0" max="3" step="1" value="0"/);
  assert.match(widget, /data-build-pore disabled/);
  assert.match(widget, /data-build-reset/);
  assert.match(widget, /<noscript>/);
  assert.match(widget, /aria-labelledby/);
  assert.match(widget, /not an atomic model or measured pore geometry/);
  assert.match(js, /range\.addEventListener\('input', render\)/);
  assert.match(js, /pore\.addEventListener\('change', render\)/);
  assert.match(js, /reset\.addEventListener\('click'/);
  assert.match(js, /pore\.disabled = n === 0/);
  assert.match(js, /poreCaption\.hidden = !showPore/);
  assert.match(js, /poreKey\.hidden = !showPore/);
  assert.match(js, /range\.setAttribute\('aria-valuetext', valueText\)/);
  assert.match(css, /\.fw-mof-build__stage svg/);
  assert.match(widget, /data-build-overlay-note/);
  assert.match(widget, /data-build-pore-detail/);
  assert.match(widget, /One opening, magnified/);
  assert.match(widget, /deliberately exaggerated/);
  assert.match(js, /paintOpening\(scene, view, anchor\)/);
  assert.match(js, /poreMarkerRadius\(view\.scale\)/);
  assert.match(js, /poreDetail\.hidden = !showPore/);
  assert.match(js, /overlayNote\.hidden = !showPore/);
  assert.match(css, /\.fw-mof-build__pore-detail\[hidden\]/);
  assert.match(css, /\.fw-mof-build__pore-window/);
  assert.match(css, /#084B9E/);
  assert.match(css, /#9E382E/);
  assert.match(css, /#089E4B/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors: active/);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:body|canvas|\.article-body|\.site-header|\.home)\s*\{/);
});

test('prototype is unlisted and noindex; actual Article 01 remains an unpublished draft', () => {
  const article = read('../site-content/articles/build-with-molecules/index.md');
  const preview = read('../site-content/preview/mof-build/index.md');
  const template = read('../layouts/preview/single.html');
  assert.match(article, /^draft: true$/m);
  assert.match(article, /^editorial_status: outline$/m);
  assert.match(article, /\{\{< mof-build-3d >\}\}/);
  assert.match(article, /figure-placeholder number="2"/);
  assert.match(preview, /\{\{< mof-build-3d >\}\}/);
  assert.match(preview, /^draft: false$/m);
  assert.match(template, /name="robots" content="noindex,nofollow"/);
  assert.match(template, /define "head-extra"/);
  assert.match(preview, /conceptual network/);
});

test('diagram copies distinguish repetition, cavity geometry, and measured adsorption', () => {
  const widget = read('../layouts/shortcodes/mof-build.html');
  const app = read('../assets/mof-build/app.js');
  const states = STATES.map(s => s.explanation).join(' ');
  assert.match(states, /not larger pores/);
  assert.match(widget, /not a molecule, measured diameter, or proof of accessible porosity/);
  assert.match(widget, /not a measured MOF-5 unit cell or an adsorption simulation/);
  assert.match(app, /not to scale/);
});
