// Pure model for the Article 01 conceptual 3D viewer.
// One model unit is the distance between neighboring schematic nodes.
// These are NOT crystal coordinates or units of length (Å, nm, etc.).
export const STAGES = Object.freeze([
  {label:'Pieces', title:'Start with the pieces',
   explanation:'Two building-block roles: a metal-containing node and an organic linker.'},
  {label:'1 × 1 × 1', title:'One repeating block',
   explanation:'A single open block makes the connections visible. The network continues beyond its edges.'},
  {label:'2 × 2 × 2', title:'Eight repeating blocks',
   explanation:'The same connections extend in three directions to form eight adjacent blocks.'},
  {label:'3 × 3 × 3', title:'Twenty-seven repeating blocks',
   explanation:'More repeats make a bigger piece of the framework, but the openings do not get bigger.'}
]);

export const PITCH = 1; // arbitrary drawing/model units per conceptual edge
export const NODE_RADIUS = 0.115; // arbitrary model units
export const LINK_RADIUS = 0.052; // arbitrary model units
export const VOID_RADIUS = 0.4; // arbitrary model units; diameter = 0.8 of one repeat pitch

export function makeGraph(n) {
  if (![1,2,3].includes(n) || !Number.isInteger(n)) throw new RangeError('Expected 1–3 repeats.');
  const nodes=[], edges=[];
  const id=(x,y,z)=>x+':'+y+':'+z;
  for(let x=0;x<=n;x++) for(let y=0;y<=n;y++) for(let z=0;z<=n;z++) {
    nodes.push({id:id(x,y,z), x,y,z});
    if(x<n) edges.push({from:id(x,y,z),to:id(x+1,y,z),a:{x,y,z},b:{x:x+1,y,z}});
    if(y<n) edges.push({from:id(x,y,z),to:id(x,y+1,z),a:{x,y,z},b:{x,y:y+1,z}});
    if(z<n) edges.push({from:id(x,y,z),to:id(x,y,z+1),a:{x,y,z},b:{x,y,z:z+1}});
  }
  return {n,nodes,edges,blocks:n*n*n};
}

// Choose a cavity visible from the initial upper/front camera direction.
// The sphere remains at a real three-dimensional coordinate inside its block.
export function voidCenter(n) {
  if (![1,2,3].includes(n) || !Number.isInteger(n)) throw new RangeError('Expected 1–3 repeats.');
  const mid=Math.floor((n-1)/2)+0.5;
  return {x:mid, y:n-0.5, z:n-0.5};
}

export function centerCoordinate(p,n) {
  return {x:(p.x-n/2)*PITCH,y:(p.y-n/2)*PITCH,z:(p.z-n/2)*PITCH};
}

// In this intentionally simple cube-and-strut model, the shortest distance
// from the center of a unit block to an edge strut's axis is sqrt(1/2).
// Do not report this as a physical MOF pore-limiting diameter.
export function schematicClearance() {
  return Math.sqrt(0.5)*PITCH-LINK_RADIUS;
}
