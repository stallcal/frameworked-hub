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

export function projectIsometric({x, y, z}) {
  // Lengths below are drawing-unit ratios only, not crystallographic lengths.
  return {x: (x - y) * 0.87, y: (x + y) * 0.49 - z * 1.06};
}

export function poreAnchor(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new RangeError('Unsupported repeat count.');
  const middle = Math.floor((n - 1) / 2) + 0.5;
  return {x: middle, y: middle, z: middle};
}

export function sceneExtents(nodes) {
  const points = nodes.map(projectIsometric);
  return {
    minX: Math.min(...points.map(p => p.x)),
    maxX: Math.max(...points.map(p => p.x)),
    minY: Math.min(...points.map(p => p.y)),
    maxY: Math.max(...points.map(p => p.y))
  };
}
