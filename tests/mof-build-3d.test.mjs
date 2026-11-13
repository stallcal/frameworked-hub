import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const source=read('../static/js/mof-build-3d/model.js');
const model=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const {STAGES,makeGraph,voidCenter,centerCoordinate,PITCH,NODE_RADIUS,LINK_RADIUS,VOID_RADIUS,schematicClearance}=model;

const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function distanceToSegment(p,a,b){
  const v={x:b.x-a.x,y:b.y-a.y,z:b.z-a.z};
  const w={x:p.x-a.x,y:p.y-a.y,z:p.z-a.z};
  const t=Math.max(0,Math.min(1,(w.x*v.x+w.y*v.y+w.z*v.z)/(v.x*v.x+v.y*v.y+v.z*v.z)));
  return distance(p,{x:a.x+t*v.x,y:a.y+t*v.y,z:a.z+t*v.z});
}

test('four distinct stages and invalid repetition inputs are rejected',()=>{
  assert.deepEqual(STAGES.map(s=>s.label),['Pieces','1 × 1 × 1','2 × 2 × 2','3 × 3 × 3']);
  for(const invalid of [0,4,-1,.5,2.2,NaN,Infinity,'2',undefined]) {
    assert.throws(()=>makeGraph(invalid),RangeError);
    assert.throws(()=>voidCenter(invalid),RangeError);
  }
});

test('3D cubic graph has unique shared nodes and edges at all sizes',()=>{
  for(let n=1;n<=3;n++){
    const graph=makeGraph(n);
    assert.equal(graph.blocks,n**3);
    assert.equal(graph.nodes.length,(n+1)**3);
    assert.equal(graph.edges.length,3*n*(n+1)**2);
    const nodeIds=new Set(graph.nodes.map(p=>p.id));
    assert.equal(nodeIds.size,graph.nodes.length);
    const edgeIds=new Set();
    for(const e of graph.edges){
      assert.ok(nodeIds.has(e.from));
      assert.ok(nodeIds.has(e.to));
      assert.equal(distance(e.a,e.b),1);
      const key=[e.from,e.to].sort().join('/');
      assert.ok(!edgeIds.has(key),'duplicate shared edge '+key);
      edgeIds.add(key);
    }
  }
});

test('pore sphere is dimensionally consistent within the schematic, not a physical pore value',()=>{
  assert.equal(PITCH,1); // input pitch = 1 arbitrary model unit
  assert.equal(VOID_RADIUS,.58); // sphere radius in the same model units
  assert.equal(2*VOID_RADIUS,1.16*PITCH); // diameter is 116% of the pitch
  assert.ok(VOID_RADIUS < schematicClearance(),'sphere smaller than edge clearance');
  for(let n=1;n<=3;n++){
    const graph=makeGraph(n);
    const cavity=voidCenter(n);
    for(const dimension of [cavity.x,cavity.y,cavity.z]){
      assert.equal(dimension%1,.5,'marker belongs strictly inside one repeat cell');
      assert.ok(dimension>0 && dimension<n);
    }
    const pos=centerCoordinate(cavity,n);
    assert.ok(Number.isFinite(pos.x)&&Number.isFinite(pos.y)&&Number.isFinite(pos.z));
    const minNode=Math.min(...graph.nodes.map(p=>distance(cavity,p)));
    const minStrut=Math.min(...graph.edges.map(e=>distanceToSegment(cavity,e.a,e.b)));
    assert.ok(minNode>VOID_RADIUS+NODE_RADIUS,'sphere must not intersect a node');
    assert.ok(minStrut>VOID_RADIUS+LINK_RADIUS,'sphere must not intersect a strut');
  }
});

test('shortcode provides pinned module imports and an accessible no-JS fallback',()=>{
  const html=read('../layouts/shortcodes/mof-build-3d.html');
  const article=read('../site-content/articles/build-with-molecules/index.md');
  const preview=read('../site-content/preview/mof-build/index.md');
  assert.match(html,/Page\.Scratch\.Get "mofBuild3DAssetsLoaded"/);
  assert.match(html,/type="importmap"/);
  assert.match(html,/"three":"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.187\.0\/build\/three\.module\.js"/);
  assert.match(html,/"three\/addons\/":"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.187\.0\/examples\/jsm\/"/);
  assert.match(html,/src="\{\{ "\/js\/mof-build-3d\/app\.js" \| relURL \}\}"/);
  assert.match(html,/data-mof-build-3d/);
  assert.match(html,/data-3d-mount/);
  assert.equal((html.match(/data-3d-stage="[0-3]"/g)||[]).length,4);
  assert.match(html,/data-3d-stage="0" aria-pressed="true"/);
  assert.match(html,/data-3d-stage="3" aria-pressed="false"/);
  assert.match(html,/role="group" aria-labelledby/);
  assert.doesNotMatch(html,/data-3d-range/);
  assert.match(html,/data-3d-pore disabled/);
  assert.match(html,/data-3d-focus hidden disabled/);
  assert.match(html,/data-3d-reset/);
  assert.match(html,/data-3d-left disabled/);
  assert.match(html,/data-3d-right disabled/);
  assert.match(html,/<noscript>/);
  assert.match(html,/data-3d-fallback/);
  assert.match(html,/fill="#9E382E"/);
  assert.match(html,/fill="#084B9E"/);
  assert.match(html,/solid Frameworked-green sphere/);
  assert.match(html,/not a measured MOF-5 crystal structure/);
  assert.match(article,/^draft: true$/m);
  assert.match(article,/^editorial_status: outline$/m);
  assert.match(article,/\{\{< mof-build-3d >\}\}/);
  assert.match(article,/figure-placeholder number="2"/);
  assert.match(preview,/\{\{< mof-build-3d >\}\}/);
  assert.match(preview,/^draft: false$/m);
});

test('viewer implements instanced meshes, orbit controls, lazy loading and no idle loop',()=>{
  const app=read('../static/js/mof-build-3d/app.js');
  const scene=read('../static/js/mof-build-3d/scene.js');
  const css=read('../assets/mof-build-3d/style.css');
  assert.match(scene,/import \* as THREE from 'three'/);
  assert.match(scene,/OrbitControls/);
  assert.match(scene,/color:MODEL_PORE,roughness:1,metalness:0/);
  assert.match(scene,/transparent:false,opacity:1,depthWrite:true/);
  assert.doesNotMatch(scene,/poreRim|emissiveIntensity|wireframe:true/);
  assert.ok(scene.includes('new THREE.HemisphereLight(0xffffff,0xe7eef6,1.0)'));
  assert.match(scene,/const MODEL_NODE=0x9E382E, MODEL_LINK=0x084B9E, MODEL_PORE=0x089E4B;/);
  assert.ok(scene.includes('new THREE.DirectionalLight(0xffffff,1.05)'));
  assert.doesNotMatch(scene,/MODEL_NODE=0xCFA6A0|MODEL_LINK=0x678DB5|MODEL_PORE=0x83B99A/);
  assert.doesNotMatch(scene,/slider to change repeats/);
  assert.match(scene,/new THREE\.InstancedMesh/g);
  assert.match(scene,/group\.add\(nodesMesh,edgesMesh\)/);
  assert.match(scene,/controls\.enablePan=false/);
  assert.match(scene,/setPore\(visible\)/);
  assert.match(scene,/function focusPore\(\)/);
  assert.match(scene,/function rotate\(delta\)/);
  assert.match(scene,/renderer\.setPixelRatio\(Math\.min/);
  assert.match(scene,/requestAnimationFrame\(draw\)/);
  assert.doesNotMatch(scene,/setAnimationLoop\(/);
  assert.match(scene,/new ResizeObserver\(resize\)/);
  assert.match(app,/import\('\.\/scene\.js'\)/);
  assert.match(app,/IntersectionObserver/);
  assert.match(app,/stageButtons\.forEach\(\(button,i\)=>button\.addEventListener\('click',\(\)=>selectStage\(i\)\)\)/);
  assert.match(app,/button\.setAttribute\('aria-pressed',String\(i===n\)\)/);
  assert.match(app,/focus\.hidden=!\(visible&&viewer\)/);
  assert.match(app,/webglcontextlost/);
  assert.match(app,/fallback\.hidden=true/);
  assert.match(app,/loader\.textContent='3D is unavailable here/);
  assert.match(css,/\.fw-mof-3d__mount canvas/);
  assert.match(css,/\.fw-mof-3d__stages \{/);
  assert.ok(css.includes('.fw-mof-3d__swatch--node {background:var(--fw3-red)'));
  assert.ok(css.includes('background:var(--fw3-blue)'));
  assert.ok(css.includes('.fw-mof-3d__swatch--void {background:var(--fw3-green)'));
  assert.doesNotMatch(css,/#CFA6A0|#678DB5|#83B99A/);
  assert.match(css,/aria-pressed="true"/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/forced-colors:active/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css,/(?:^|\n)\s*(?:body|canvas|\.article-body|\.site-header|\.home)\s*\{/);
});
