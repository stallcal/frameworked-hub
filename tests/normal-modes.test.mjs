import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {MOLECULES,degrees,displacedPositions,bondAngle,distance} from '../assets/normal-modes/modes.js';

const expected={co2:4,h2o:3,nh3:6,ch4:9};
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const multiply=(a,k)=>a.map(v=>v*k);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const norm=a=>Math.hypot(...a);

test('3N-5 / 3N-6 matches all explicit normal coordinates',()=>{
  for(const molecule of MOLECULES){
    const d=degrees(molecule);
    assert.equal(d.vibrations,expected[molecule.id]);
    assert.equal(molecule.modes.length,d.vibrations);
    assert.equal(d.total,d.translations+d.rotations+d.vibrations);
    assert.equal(new Set(molecule.modes.map(m=>m.id)).size,d.vibrations);
  }
});

test('each mode is free of translation and rigid rotation',()=>{
  for(const molecule of MOLECULES){
    const M=molecule.atoms.reduce((s,a)=>s+a.mass,0);
    const com=multiply(molecule.atoms.reduce((s,a)=>add(s,multiply(a.pos,a.mass)),[0,0,0]),1/M);
    for(const mode of molecule.modes){
      const momentum=mode.displacement.reduce((s,d,i)=>add(s,multiply(d,molecule.atoms[i].mass)),[0,0,0]);
      const torque=mode.displacement.reduce((s,d,i)=>{
        const r=add(molecule.atoms[i].pos,multiply(com,-1));
        return add(s,multiply(cross(r,d),molecule.atoms[i].mass));
      },[0,0,0]);
      assert.ok(norm(momentum)<1e-7,molecule.id+' '+mode.id+' translates');
      assert.ok(norm(torque)<1e-7,molecule.id+' '+mode.id+' rotates');
      assert.ok(mode.displacement.every(d=>d.every(Number.isFinite)));
    }
  }
});

test('vibrational displacement coordinates are mutually mass orthogonal',()=>{
  for(const molecule of MOLECULES){
    for(let i=0;i<molecule.modes.length;i++){
      for(let j=i+1;j<molecule.modes.length;j++){
        const a=molecule.modes[i].displacement,b=molecule.modes[j].displacement;
        const product=a.reduce((s,v,k)=>s+molecule.atoms[k].mass*dot(v,b[k]),0);
        assert.ok(Math.abs(product)<1e-7,molecule.id+': '+i+' and '+j+' not orthogonal');
      }
    }
  }
});

test('symmetry activities and degeneracies are consistent',()=>{
  const byId=Object.fromEntries(MOLECULES.map(m=>[m.id,m]));
  assert.deepEqual(byId.co2.modes.map(m=>[m.ir,m.raman]),[[false,true],[true,false],[true,false],[true,false]]);
  assert.equal(byId.h2o.modes.filter(m=>m.ir&&m.raman).length,3);
  assert.equal(byId.nh3.modes.filter(m=>m.ir&&m.raman).length,6);
  assert.deepEqual(byId.ch4.modes.map(m=>m.ir),[false,false,false,true,true,true,true,true,true]);
  assert.equal(byId.ch4.modes.filter(m=>m.raman).length,9);
  assert.deepEqual(byId.ch4.modes.map(m=>m.group),['ν1','ν2','ν2','ν3','ν3','ν3','ν4','ν4','ν4']);
});

test('CO2 stretching and bending patterns reproduce qualitative changes',()=>{
  const m=MOLECULES.find(m=>m.id==='co2');
  const equilibrium=m.atoms.map(a=>a.pos);
  const eqBond=distance(equilibrium[0],equilibrium[1]);
  const sym=displacedPositions(m,m.modes[0],.2,1);
  assert.ok(distance(sym[0],sym[1])-eqBond>0);
  assert.ok(distance(sym[2],sym[1])-eqBond>0);
  const asym=displacedPositions(m,m.modes[1],.2,1);
  const changeLeft=distance(asym[0],asym[1])-eqBond;
  const changeRight=distance(asym[2],asym[1])-eqBond;
  assert.ok(changeLeft*changeRight<0);
  const bent=displacedPositions(m,m.modes[2],.2,1);
  assert.ok(bondAngle(bent[0],bent[1],bent[2])<180);
});

test('water bending motion changes H-O-H angle',()=>{
  const m=MOLECULES.find(m=>m.id==='h2o');
  const eq=bondAngle(m.atoms[1].pos,m.atoms[0].pos,m.atoms[2].pos);
  const displaced=displacedPositions(m,m.modes[1],.2,1);
  assert.ok(Math.abs(bondAngle(displaced[1],displaced[0],displaced[2])-eq)>.1);
});


test('ammonia geometry matches NIST equilibrium geometry, not a 120-degree H-N-H bond angle',()=>{
  const m=MOLECULES.find(m=>m.id==='nh3');
  const nitrogen=m.atoms[0].pos;
  for(let i=1;i<4;i++){
    assert.ok(Math.abs(distance(nitrogen,m.atoms[i].pos)-1.012)<1e-8);
  }
  for(const [i,j] of [[1,2],[1,3],[2,3]]){
    const angle=bondAngle(m.atoms[i].pos,nitrogen,m.atoms[j].pos);
    assert.ok(Math.abs(angle-106.7)<1e-9,'H-N-H angle '+i+'-'+j+': '+angle);
    const a=m.atoms[i].pos,b=m.atoms[j].pos;
    const cosAzimuth=(a[0]*b[0]+a[1]*b[1])/
      Math.hypot(a[0],a[1])/Math.hypot(b[0],b[1]);
    assert.ok(Math.abs(cosAzimuth+0.5)<1e-10,'H azimuthal separation must be 120 degrees');
  }
});

test('schematic displacement arrow shafts stop inside the arrowhead, before its tip',()=>{
  const source=readFileSync(new URL('../assets/normal-modes/app.js',import.meta.url),'utf8');
  assert.match(source,/shaftX=tx-ox\*headLength\*\.8/);
  assert.match(source,/shaftY=ty-oy\*headLength\*\.8/);
  assert.match(source,/'stroke-linecap':'butt'/);
  assert.match(source,/'polygon',\{points:tx\+','\+ty/);
});


test('ball-and-stick renderer hides all bond interiors behind opaque atom spheres',()=>{

  const source=readFileSync(new URL('../assets/normal-modes/app.js',import.meta.url),'utf8')
    .replace(/^import [^\n]+\n/,'')
    .replace(/document\.querySelectorAll\('\[data-normal-modes\]'\)\.forEach\(attachNormalModes\);/,'');
  const createNode=(tag)=>{
    const obj={tag,attrs:{},children:[],dataset:{},
      setAttribute(name,value){this.attrs[name]=value;},
      append(...children){this.children.push(...children);},
      replaceChildren(...children){this.children=[...children];},
      querySelector(){return null;}};
    return obj;
  };
  const document={createElementNS:(_ns,tag)=>createNode(tag)};
  const ctx={document,displacedPositions};
  runInNewContext(source+'\nthis.renderMoleculeForTest=renderMolecule;',ctx);
  for(const molecule of MOLECULES){
    for(const mode of molecule.modes){
      for(const diagram of [false,true]){
        const scene=createNode('g');
        const svg=createNode('svg');
        svg.querySelector=()=>scene;
        ctx.renderMoleculeForTest(svg,molecule,mode,0.7,1.0,0.4,0.3,false,false,diagram);
        const tags=scene.children.map(child=>child.tag);
        // Expected painter order: gradients, equilibrium guides, bonds, spheres.
        const bondLayer=scene.children[2],sphereLayer=scene.children[3];
        assert.equal(bondLayer.tag,'g');
        assert.equal(sphereLayer.tag,'g');
        assert.equal(bondLayer.children.length,molecule.bonds.length);
        assert.equal(sphereLayer.children.length,molecule.atoms.length);
        // Exactly one flat, uniform stroke per bond in both visual modes.
        assert.ok(bondLayer.children.every(line=>line.tag==='line'));
        assert.ok(bondLayer.children.every(line=>line.attrs.stroke==='#718096'));
        assert.ok(bondLayer.children.every(line=>Number(line.attrs['stroke-width'])===(diagram?6:11)));
        assert.ok(bondLayer.children.every(line=>line.attrs['stroke-linecap']==='round'));
        assert.ok(bondLayer.children.every(line=>!('stroke-opacity' in line.attrs)));
        assert.ok(sphereLayer.children.every(g=>g.children[0].tag==='circle'));
        assert.ok(sphereLayer.children.every(g=>g.children[0].attrs.fill!=='none'));
      }
    }
  }
});
