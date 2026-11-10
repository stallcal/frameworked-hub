// Geometry and schematic mass-orthogonal vibrational displacement patterns.
// Internal coordinates are in approximate angstroms. Frequencies are illustrative
// literature gas-phase fundamentals, not calculated by this model.

const H = 1.007825, C = 12, O = 15.994915, N = 14.003074;
const vec = (x=0,y=0,z=0) => [x,y,z];
const plus = (a,b) => a.map((v,i)=>v+b[i]);
const minus = (a,b) => a.map((v,i)=>v-b[i]);
const times = (a,s) => a.map(v=>v*s);
const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
const norm = a => Math.hypot(...a);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = a => times(a,1/norm(a));

function orthogonalModes(atoms, definitions) {
  const masses=atoms.map(a=>a.mass), positions=atoms.map(a=>a.pos);
  const total=masses.reduce((a,b)=>a+b,0);
  const center=times(positions.reduce((v,p,i)=>plus(v,times(p,masses[i])),vec()),1/total);
  const centered=positions.map(p=>minus(p,center));
  const inner=(a,b)=>a.reduce((s,v,i)=>s+masses[i]*dot(v,b[i]),0);
  const basis=[];
  function project(raw) {
    let v=raw.map(a=>a.slice());
    for(const b of basis) {
      const coeff=inner(v,b);
      v=v.map((p,i)=>minus(p,times(b[i],coeff)));
    }
    const size=Math.sqrt(Math.max(0,inner(v,v)));
    if(size<1e-9)return null;
    return v.map(p=>times(p,1/size));
  }
  for(let axis=0;axis<3;axis++){
    const e=vec();e[axis]=1;
    const b=project(positions.map(()=>e));
    if(b)basis.push(b);
  }
  for(let axis=0;axis<3;axis++){
    const e=vec();e[axis]=1;
    const b=project(centered.map(p=>cross(e,p)));
    if(b)basis.push(b);
  }
  const rigid=basis.length;
  const modes=definitions.map(d=>{
    const direction=project(d.displacement);
    if(!direction)throw Error('Dependent normal-mode illustration: '+d.id);
    basis.push(direction);
    const max=Math.max(...direction.map(norm));
    const displacement=direction.map(p=>times(p,0.34/max));
    return {...d,displacement};
  });
  if(modes.length!==3*atoms.length-rigid){
    throw Error('Wrong vibrational mode count for '+atoms.length+' atoms');
  }
  return modes;
}

function atom(element,pos,mass) {return {element,pos,mass};}
function definition(id,name,kind,symmetry,frequency,ir,raman,description,displacement,group,partner=1,degeneracy=1){
  return {id,name,kind,symmetry,frequency,ir,raman,description,displacement,group,partner,degeneracy};
}

function makeCO2(){
  const atoms=[atom('O',[-1.16,0,0],O),atom('C',[0,0,0],C),atom('O',[1.16,0,0],O)];
  const d=[
    definition('co2-sym','Symmetric stretch','Stretch','Σg+',1333,false,true,'Both C–O bonds lengthen and shorten together. The dipole remains zero, while the polarizability changes.',[[-1,0,0],[0,0,0],[1,0,0]],'ν1'),
    definition('co2-asym','Asymmetric stretch','Stretch','Σu+',2349,true,false,'One C–O bond lengthens as the other shortens. The vibration creates an oscillating dipole along the molecular axis.',[[1,0,0],[0,0,0],[1,0,0]],'ν3'),
    definition('co2-bend-y','Bend · in-plane','Bend','Πu',667,true,false,'The molecule bends in the plane of the screen. A linear molecule has two perpendicular, energetically degenerate bends.',[[0,1,0],[0,0,0],[0,1,0]],'ν2',1,2),
    definition('co2-bend-z','Bend · perpendicular','Bend','Πu',667,true,false,'The companion bend moves perpendicular to the first bending plane. These two coordinates share one fundamental frequency.',[[0,0,1],[0,0,0],[0,0,1]],'ν2',2,2)
  ];
  return {id:'co2',name:'Carbon dioxide',formula:'CO₂',geometry:'Linear',pointGroup:'D∞h',linear:true,atoms,bonds:[[0,1],[1,2]],modes:orthogonalModes(atoms,d),angle:[0,1,2],angleLabel:'O–C–O'};
}

function makeH2O(){
  const atoms=[atom('O',[0,0,0],O),atom('H',[-.758,0,.586],H),atom('H',[.758,0,.586],H)];
  const u1=unit(atoms[1].pos),u2=unit(atoms[2].pos);
  const d=[
    definition('h2o-sym','Symmetric stretch','Stretch','A₁',3657,true,true,'The two O–H bonds stretch together. Both the dipole and polarizability change.',[vec(),u1,u2],'ν1'),
    definition('h2o-bend','H–O–H bend','Bend','A₁',1595,true,true,'The bond angle opens and closes while the coordinated atomic motion preserves the center of mass.',[vec(),[-u1[2],0,u1[0]],[u2[2],0,-u2[0]]],'ν2'),
    definition('h2o-asym','Asymmetric stretch','Stretch','B₁',3756,true,true,'The O–H bonds stretch out of phase. The B₁ designation assumes the molecular plane is xz.',[vec(),u1,times(u2,-1)],'ν3')
  ];
  return {id:'h2o',name:'Water',formula:'H₂O',geometry:'Bent',pointGroup:'C₂v',linear:false,atoms,bonds:[[0,1],[0,2]],modes:orthogonalModes(atoms,d),angle:[1,0,2],angleLabel:'H–O–H'};
}

function makeNH3(){
  const angles=[0,2*Math.PI/3,4*Math.PI/3];
  const atoms=[atom('N',[0,0,.38],N),...angles.map(a=>atom('H',[.94*Math.cos(a),.94*Math.sin(a),-.13],H))];
  const bonds=atoms.slice(1).map(a=>unit(minus(a.pos,atoms[0].pos)));
  const d=[
    definition('nh3-sym','Symmetric stretch','Stretch','A₁',3337,true,true,'All three N–H bonds stretch together. This is the nondegenerate A₁ stretching vibration.',[vec(),...bonds],'ν1'),
    definition('nh3-umbrella','Umbrella inversion','Bend','A₁',950,true,true,'The three H atoms move collectively relative to nitrogen. The umbrella-like normal coordinate is distinct from full inversion through the planar geometry.',[[0,0,1],[0,0,-1],[0,0,-1],[0,0,-1]],'ν2')
  ];
  for(let j=0;j<2;j++){
    const w=angles.map(a=>j===0?Math.cos(a):Math.sin(a));
    d.push(definition('nh3-estretch-'+j,'Asymmetric stretch · '+(j+1),'Stretch','E',3444,true,true,'A partner of the doubly degenerate E stretching vibration; symmetry-related linear combinations are equally valid.',[vec(),...bonds.map((b,i)=>times(b,w[i]))],'ν3',j+1,2));
  }
  for(let j=0;j<2;j++){
    const w=angles.map(a=>j===0?Math.cos(a):Math.sin(a));
    d.push(definition('nh3-ebend-'+j,'Asymmetric bend · '+(j+1),'Bend','E',1627,true,true,'A partner of the doubly degenerate E bending motion. Atomic displacements are corrected to remove rigid translation and rotation.',[vec(),...angles.map((a,i)=>[-Math.sin(a)*w[i],Math.cos(a)*w[i],0])],'ν4',j+1,2));
  }
  return {id:'nh3',name:'Ammonia',formula:'NH₃',geometry:'Trigonal pyramidal',pointGroup:'C₃v',linear:false,atoms,bonds:[[0,1],[0,2],[0,3]],modes:orthogonalModes(atoms,d),angle:[1,0,2],angleLabel:'H–N–H'};
}

function makeCH4(){
  const t=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
  const radii=t.map(p=>times(unit(p),1.09));
  const atoms=[atom('C',vec(),C),...radii.map(p=>atom('H',p,H))];
  const u=radii.map(unit);
  const d=[definition('ch4-sym','Symmetric stretch','Stretch','A₁',2917,false,true,'All four C–H bonds stretch in phase. Tetrahedral symmetry forbids this fundamental in ordinary IR absorption.',[vec(),...u],'ν1')];
  for(let j=0;j<2;j++){
    const diagonal=j===0?[1,-1,0]:[1,1,-2];
    d.push(definition('ch4-ebend-'+j,'Symmetric deformation · '+(j+1),'Bend','E',1534,false,true,'A partner of the E bending pair. The symmetric deformation changes bond angles but produces no first-order dipole derivative.',[vec(),...u.map(p=>p.map((v,i)=>v*diagonal[i]))],'ν2',j+1,2));
  }
  for(let j=0;j<3;j++){
    d.push(definition('ch4-fstretch-'+j,'Asymmetric stretch · '+(j+1),'Stretch','F₂',3019,true,true,'One of three symmetry-equivalent F₂ stretching components. Both the molecular dipole and polarizability change.',[vec(),...u.map(p=>times(p,p[j]))],'ν3',j+1,3));
  }
  const pairs=[[0,1],[0,2],[1,2]];
  for(let j=0;j<3;j++){
    const [a,b]=pairs[j];
    d.push(definition('ch4-fbend-'+j,'Asymmetric deformation · '+(j+1),'Bend','F₂',1306,true,true,'One of three symmetry-equivalent F₂ deformations. In Tᵈ symmetry, F₂ vibrations are allowed in both IR and Raman fundamentals.',[vec(),...u.map(p=>{const v=vec();v[a]=p[b];v[b]=p[a];return minus(v,times(p,dot(v,p)));})],'ν4',j+1,3));
  }
  return {id:'ch4',name:'Methane',formula:'CH₄',geometry:'Tetrahedral',pointGroup:'Tᵈ',linear:false,atoms,bonds:[[0,1],[0,2],[0,3],[0,4]],modes:orthogonalModes(atoms,d),angle:[1,0,2],angleLabel:'H–C–H'};
}

export const MOLECULES=[makeCO2(),makeH2O(),makeNH3(),makeCH4()];
export function findMolecule(id){return MOLECULES.find(m=>m.id===id)||MOLECULES[0];}
export function degrees(m){return {total:3*m.atoms.length,translations:3,rotations:m.linear?2:3,vibrations:3*m.atoms.length-(m.linear?5:6)};}
export function displacedPositions(m,mode,phase,amplitude){return m.atoms.map((a,i)=>plus(a.pos,times(mode.displacement[i],phase*amplitude)));}
export function distance(a,b){return norm(minus(a,b));}
export function bondAngle(a,center,b){const x=minus(a,center),y=minus(b,center);return Math.acos(Math.max(-1,Math.min(1,dot(x,y)/(norm(x)*norm(y)))))*180/Math.PI;}
