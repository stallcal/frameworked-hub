import {STATES, buildCubicGraph, projectThreeQuarter, poreAnchor, poreMarkerRadius, sceneExtents} from './model.mjs';

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
      const p = projectThreeQuarter(coords);
      return {x: WIDTH / 2 + (p.x - midX) * scale, y: HEIGHT / 2 + (p.y - midY) * scale};
    }
  };
}

function polygonPoints(view, points) {
  return points.map(coords => {
    const p = view.point(coords);
    return p.x.toFixed(2) + ',' + p.y.toFixed(2);
  }).join(' ');
}

// The highlighted cuboid is a schematic *opening*. Its faces are translucent
// teaching cues, not a computed accessible pore surface or a physical unit cell.
function paintOpening(scene, view, center) {
  const x0 = center.x - 0.5, x1 = center.x + 0.5;
  const z0 = center.z - 0.5, z1 = center.z + 0.5;
  const y0 = 0, y1 = 1;

  const faces = [
    // Back panel, faintest.
    [{x:x0,y:y1,z:z0},{x:x1,y:y1,z:z0},{x:x1,y:y1,z:z1},{x:x0,y:y1,z:z1}],
    // Side and upper surfaces suggest depth without hiding the struts.
    [{x:x1,y:y0,z:z0},{x:x1,y:y1,z:z0},{x:x1,y:y1,z:z1},{x:x1,y:y0,z:z1}],
    [{x:x0,y:y0,z:z1},{x:x1,y:y0,z:z1},{x:x1,y:y1,z:z1},{x:x0,y:y1,z:z1}]
  ];
  for (let i=0;i<faces.length;i++) {
    scene.append(element('polygon', {
      points: polygonPoints(view, faces[i]),
      class: 'fw-mof-build__pore-face fw-mof-build__pore-face--' + i
    }));
  }
  const outline = [
    {x:x0,y:0,z:z0},{x:x1,y:0,z:z0},
    {x:x1,y:0,z:z1},{x:x0,y:0,z:z1}
  ];
  scene.append(element('polygon', {
    points: polygonPoints(view, outline),
    class: 'fw-mof-build__pore-window'
  }));
}

function paintNetwork(scene, n, showPore, id) {
  const graph = buildCubicGraph(n);
  const view = fitProjection(graph.nodes);
  const anchor = poreAnchor(n);
  if (showPore) paintOpening(scene, view, anchor);

  // Rear planes are drawn first and softened: the near square face reads
  // clearly, with depth links travelling diagonally up and right.
  const struts = element('g', {class: 'fw-mof-build__struts'});
  const edges = [...graph.edges].sort((a,b) =>
    (b.a.y+b.b.y)-(a.a.y+a.b.y) ||
    (a.a.z+a.b.z)-(b.a.z+b.b.z)
  );
  const outerWidth = n === 3 ? 5.7 : n === 2 ? 6.8 : 8.8;
  const innerWidth = n === 3 ? 3.5 : n === 2 ? 4.2 : 5.5;
  const x0 = anchor.x - .5, x1 = anchor.x + .5;
  const z0 = anchor.z - .5, z1 = anchor.z + .5;

  for (const edge of edges) {
    const a = view.point(edge.a);
    const b = view.point(edge.b);
    const attrs = {x1:a.x, y1:a.y, x2:b.x, y2:b.y, 'stroke-linecap':'round'};
    const depth = (edge.a.y + edge.b.y) / (2*n);
    const isCutaway = showPore && edge.a.y===0 && edge.b.y===0 &&
      [edge.a,edge.b].every(p=>p.x>=x0 && p.x<=x1 && p.z>=z0 && p.z<=z1);
    const opacity = isCutaway ? .21 : .52 + .46*(1-depth);
    const cls = isCutaway ? 'fw-mof-build__cutaway-edge' : 'fw-mof-build__strut';
    struts.append(
      element('line', {...attrs, 'stroke-width':outerWidth, stroke:'#1C3049',
        opacity:opacity.toFixed(2), class:cls}),
      element('line', {...attrs, 'stroke-width':innerWidth, stroke:'#084B9E',
        opacity:opacity.toFixed(2), class:cls})
    );
  }
  scene.append(struts);

  // The pore ball is deliberately large and near the front, with its radius
  // set by illustration scale rather than a physical pore/guest measurement.
  if (showPore) {
    const center = view.point(anchor);
    const radius = poreMarkerRadius(view.scale);
    scene.append(
      element('circle', {cx:center.x, cy:center.y, r:radius*1.18,
        class:'fw-mof-build__pore-halo'}),
      element('circle', {cx:center.x, cy:center.y, r:radius,
        fill:'url(#' + id + '-pore-gradient)', class:'fw-mof-build__pore-ball'}),
      element('circle', {cx:center.x-radius*.28, cy:center.y-radius*.27,
        r:radius*.19, class:'fw-mof-build__pore-glint'})
    );
  }

  // Spheres sit above linkers to hide the linker interiors at joints.
  // Back-layer nodes are toned down; front-layer nodes remain high contrast.
  const nodeLayer = element('g', {class:'fw-mof-build__nodes'});
  const radius = n===3 ? 5.8 : n===2 ? 7.3 : 9.7;
  const sorted = [...graph.nodes].sort((a,b) =>
    b.y-a.y || a.z-b.z
  );
  for (const coords of sorted) {
    const p = view.point(coords);
    const fade = .6 + .4*(1-coords.y/n);
    nodeLayer.append(element('circle', {
      cx:p.x, cy:p.y, r:radius, opacity:fade.toFixed(2),
      class:'fw-mof-build__node'
    }));
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
      ? 'One oxide-red circular node and one Frameworked-blue bar appear separately.'
      : 'An angled three-quarter schematic shows ' + n ** 3 + ' repeating cubic blocks with ' +
        (n + 1) ** 3 + ' shared corner nodes and ' + 3 * n * (n + 1) ** 2 +
        ' links. ' + (showPore
          ? 'One enlarged green sphere highlights a near-facing potential void. Front links are lightly faded to reveal the space. The sphere is illustrative and not to scale.'
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
