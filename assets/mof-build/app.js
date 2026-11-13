import {STATES, buildCubicGraph, projectIsometric, poreAnchor, sceneExtents} from './model.mjs';

const NS = 'http://www.w3.org/2000/svg';
const WIDTH = 640;
const HEIGHT = 390;
const STEP_LABELS = ['01 / THE PIECES', '02 / ONE BLOCK', '03 / EIGHT BLOCKS', '04 / TWENTY-SEVEN BLOCKS'];

function element(tag, attributes = {}, text = null) {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
  if (text != null) el.textContent = text;
  return el;
}

function paintPieces(scene) {
  scene.append(
    element('circle', {cx: 180, cy: 188, r: 26, class: 'fw-mof-build__node'}),
    element('rect', {x: 341, y: 174, width: 112, height: 24, rx: 11, class: 'fw-mof-build__loose-linker'}),
    element('text', {x: 180, y: 257, 'text-anchor': 'middle', class: 'fw-mof-build__shape-label'}, 'Node'),
    element('text', {x: 397, y: 257, 'text-anchor': 'middle', class: 'fw-mof-build__shape-label'}, 'Linker')
  );
}

function fitProjection(nodes) {
  const bounds = sceneExtents(nodes);
  const width = Math.max(0.2, bounds.maxX - bounds.minX);
  const height = Math.max(0.2, bounds.maxY - bounds.minY);
  const scale = Math.min((WIDTH - 124) / width, (HEIGHT - 76) / height);
  const midX = (bounds.maxX + bounds.minX) / 2;
  const midY = (bounds.maxY + bounds.minY) / 2;
  return {
    scale,
    point(coords) {
      const p = projectIsometric(coords);
      return {x: WIDTH / 2 + (p.x - midX) * scale, y: HEIGHT / 2 + (p.y - midY) * scale};
    }
  };
}

function paintNetwork(scene, n, showPore, id) {
  const graph = buildCubicGraph(n);
  const view = fitProjection(graph.nodes);

  if (showPore) {
    const center = view.point(poreAnchor(n));
    const radius = Math.max(11, Math.min(23, view.scale * 0.16));
    scene.append(
      element('circle', {cx: center.x, cy: center.y, r: radius * 1.45, class: 'fw-mof-build__pore-halo'}),
      element('circle', {cx: center.x, cy: center.y, r: radius, fill: 'url(#' + id + '-pore-gradient)', class: 'fw-mof-build__pore-ball'}),
      element('circle', {cx: center.x - radius * 0.26, cy: center.y - radius * 0.27, r: radius * 0.2, class: 'fw-mof-build__pore-glint'})
    );
  }

  const struts = element('g', {class: 'fw-mof-build__struts'});
  const edges = [...graph.edges].sort((a, b) =>
    (a.a.x + a.a.y + a.a.z + a.b.x + a.b.y + a.b.z) -
    (b.a.x + b.a.y + b.a.z + b.b.x + b.b.y + b.b.z)
  );
  const outerWidth = n === 3 ? 5.4 : n === 2 ? 6.5 : 8.6;
  const innerWidth = n === 3 ? 3.1 : n === 2 ? 3.8 : 5.2;

  for (const edge of edges) {
    const a = view.point(edge.a);
    const b = view.point(edge.b);
    const attrs = {x1: a.x, y1: a.y, x2: b.x, y2: b.y, 'stroke-linecap': 'round'};
    const darkness = (edge.a.x + edge.a.y + edge.a.z + edge.b.x + edge.b.y + edge.b.z) / (6 * n);
    const opacity = (0.64 + darkness * 0.34).toFixed(2);
    struts.append(
      element('line', {...attrs, 'stroke-width': outerWidth, stroke: '#1C3049', opacity}),
      element('line', {...attrs, 'stroke-width': innerWidth, stroke: '#9FC4E8', opacity})
    );
  }
  scene.append(struts);

  // Painter's order: spheres lie above all struts, hiding their interiors at vertices.
  const nodeLayer = element('g', {class: 'fw-mof-build__nodes'});
  const radius = n === 3 ? 5.5 : n === 2 ? 7.1 : 9.4;
  const sorted = [...graph.nodes].sort((a, b) => (a.x + a.y + a.z) - (b.x + b.y + b.z));
  for (const coords of sorted) {
    const p = view.point(coords);
    nodeLayer.append(element('circle', {cx: p.x, cy: p.y, r: radius, class: 'fw-mof-build__node'}));
  }
  scene.append(nodeLayer);
}

function attach(widget) {
  const range = widget.querySelector('[data-build-range]');
  const pore = widget.querySelector('[data-build-pore]');
  const reset = widget.querySelector('[data-build-reset]');
  const scene = widget.querySelector('[data-build-scene]');
  const output = widget.querySelector('[data-build-output]');
  const title = widget.querySelector('[data-build-title]');
  const explanation = widget.querySelector('[data-build-explanation]');
  const stepText = widget.querySelector('[data-build-step]');
  const poreCaption = widget.querySelector('[data-build-pore-caption]');
  const poreHint = widget.querySelector('[data-pore-hint]');
  const poreKey = widget.querySelector('[data-build-void-key]');
  const svgTitle = widget.querySelector('[data-build-svg-title]');
  const svgDesc = widget.querySelector('[data-build-svg-desc]');
  if (![range, pore, reset, scene, output, title, explanation, stepText, poreCaption,
    poreHint, poreKey, svgTitle, svgDesc].every(Boolean)) return;

  function render() {
    const n = Number(range.value);
    if (!Number.isInteger(n) || n < 0 || n >= STATES.length) return;
    if (n === 0) pore.checked = false;
    pore.disabled = n === 0;
    const showPore = n > 0 && pore.checked;
    const description = STATES[n];
    const newScene = element('g', {'data-build-scene': ''});
    if (n === 0) paintPieces(newScene);
    else paintNetwork(newScene, n, showPore, widget.dataset.mofId);
    scene.replaceChildren(...newScene.childNodes);

    const valueText = n === 0 ? 'Pieces' : n + ' × ' + n + ' × ' + n;
    range.setAttribute('aria-valuetext', valueText);
    output.textContent = valueText;
    title.textContent = description.title;
    explanation.textContent = description.explanation;
    stepText.textContent = STEP_LABELS[n];
    poreHint.textContent = n === 0 ? 'Build one block first to show a potential void.' :
      'The ball marks possible space, not a measured pore or a gas molecule.';
    poreCaption.hidden = !showPore;
    poreKey.hidden = !showPore;
    svgTitle.textContent = n === 0 ? 'Separate conceptual node and linker' :
      n + ' by ' + n + ' by ' + n + ' connected conceptual repeating blocks';
    svgDesc.textContent = n === 0
      ? 'One red circular node and one blue bar appear separately.'
      : 'A fixed isometric schematic shows ' + n ** 3 + ' repeating cubic blocks with ' +
        (n + 1) ** 3 + ' shared corner nodes and ' + 3 * n * (n + 1) ** 2 +
        ' links. ' + (showPore
          ? 'One green sphere marks a potential void; it is illustrative and not to scale.'
          : 'The optional potential-void marker is not displayed.');
  }

  range.addEventListener('input', render);
  range.addEventListener('change', render);
  pore.addEventListener('change', render);
  reset.addEventListener('click', () => {
    range.value = '0';
    pore.checked = false;
    render();
    range.focus();
  });
  render();
}

document.querySelectorAll('[data-mof-build]').forEach(attach);
