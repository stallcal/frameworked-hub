// Schematic cubic graph, not a crystallographic coordinate model.
// Nodes are integer grid vertices; edges are single axis-neighbor connections.
// No atom positions, bond lengths, pore diameters or sorption values are encoded.
export const STATES = Object.freeze([
  {label: 'Building pieces', title: 'Start with the pieces', explanation: 'A metal-containing building unit and an organic linker are two kinds of pieces in our simplified model.'},
  {label: '1 × 1 × 1', title: 'One repeating block', explanation: 'One block shows a three-dimensional connection pattern. The framework does not stop at the drawn edges.'},
  {label: '2 × 2 × 2', title: 'Eight repeating blocks', explanation: 'Eight copies show how the same connection pattern extends in three directions.'},
  {label: '3 × 3 × 3', title: 'Twenty-seven repeating blocks', explanation: 'A larger region contains more repeats of the same pattern—not larger pores.'}
]);

export function buildCubicGraph(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3) {
    throw new RangeError('Schematic repeat count must be an integer from 1 to 3.');
  }
  const nodes = [];
  const edges = [];
  const id = (x, y, z) => x + ':' + y + ':' + z;
  for (let z = 0; z <= n; z++) {
    for (let y = 0; y <= n; y++) {
      for (let x = 0; x <= n; x++) {
        nodes.push({id: id(x, y, z), x, y, z});
        if (x < n) edges.push({from: id(x, y, z), to: id(x + 1, y, z), a: {x, y, z}, b: {x: x + 1, y, z}, axis: 'x'});
        if (y < n) edges.push({from: id(x, y, z), to: id(x, y + 1, z), a: {x, y, z}, b: {x, y: y + 1, z}, axis: 'y'});
        if (z < n) edges.push({from: id(x, y, z), to: id(x, y, z + 1), a: {x, y, z}, b: {x, y, z: z + 1}, axis: 'z'});
      }
    }
  }
  return {n, nodes, edges, blocks: n ** 3};
}

// Oblique three-quarter projection: x is visibly horizontal, z is vertical,
// and depth (y) recedes up and right. These are *drawing* axes, not a claim
// about any specific crystallographic cell or a perspective-correct camera.
export function projectThreeQuarter({x, y, z}) {
  return {x: x + y * 0.52, y: -z - y * 0.36};
}

// Choose a near/front opening so the marker is visible rather than hidden in
// the middle of an opaque 3×3×3 line drawing. One marker represents one void.
export function poreAnchor(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new RangeError('Unsupported repeat count.');
  const center = Math.floor(n / 2) + 0.5;
  return {x: center, y: 0.5, z: center};
}

export function poreMarkerRadius(scale) {
  if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('Drawing scale must be positive.');
  // Radius in SVG drawing units. No physical length or radius is implied.
  return Math.max(18, Math.min(56, scale * 0.34));
}

export function sceneExtents(nodes) {
  const points = nodes.map(projectThreeQuarter);
  return {
    minX: Math.min(...points.map(p => p.x)),
    maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)),
    maxY: Math.max(...points.map(p => p.y))
  };
}
