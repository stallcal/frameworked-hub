import {findMolecule,degrees,displacedPositions,distance,bondAngle} from './modes.js';

const SVG='http://www.w3.org/2000/svg';
const ELEMENTS={
  C:{color:'#424b59',text:'#ffffff',radius:21},
  O:{color:'#b84036',text:'#ffffff',radius:21},
  N:{color:'#205aa5',text:'#ffffff',radius:21},
  H:{color:'#e6eaf0',text:'#26364c',radius:16}
};

function node(name,attrs={},text){
  const result=document.createElementNS(SVG,name);
  for(const [key,value] of Object.entries(attrs))result.setAttribute(key,String(value));
  if(text!==undefined)result.textContent=text;
  return result;
}
function length(a){return Math.hypot(...a);}
function add(a,b){return a.map((v,i)=>v+b[i]);}
function scale(a,k){return a.map(v=>v*k);}
function rotate(p,yaw,pitch){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const x=p[0]*cy+p[2]*sy;
  const z=-p[0]*sy+p[2]*cy;
  return [x,p[1]*cp-z*sp,p[1]*sp+z*cp];
}
function project(p,yaw,pitch,zoom){
  const v=rotate(p,yaw,pitch);
  // Modest perspective: nearer atoms appear slightly larger and farther apart.
  const perspective=5.4/(5.4-v[2]);
  return {x:320+v[0]*zoom*perspective,y:195-v[1]*zoom*perspective,z:v[2],perspective};
}
function setText(root,id,value){const element=root.querySelector('[data-nm="'+id+'"]');if(element)element.textContent=value;}
function setClass(el,value){el.classList.remove('nm-yes','nm-no');el.classList.add(value?'nm-yes':'nm-no');el.textContent=value?'Active':'Inactive';}

// Uses the same camera at all animation phases; dragging changes orientation only.
const CAMERAS={
  co2:{yaw:.36,pitch:-.24},
  h2o:{yaw:.30,pitch:-.33},
  nh3:{yaw:.48,pitch:.52},
  ch4:{yaw:.28,pitch:.27}
};
const cameraFor=molecule=>CAMERAS[molecule.id]||CAMERAS.co2;
let sceneNumber=0;

function renderMolecule(svg,molecule,mode,phase,amplitude,yaw,pitch,arrows,equilibrium,diagram){
  const scene=svg.querySelector('.nm-scene');
  if(!scene)return;
  scene.replaceChildren();
  const positions=displacedPositions(molecule,mode,phase,amplitude);
  const base=molecule.atoms.map(a=>a.pos);
  const radius=Math.max(...base.map(length));
  const zoom=Math.min(135,Math.max(86,161/Math.max(1.15,radius)));
  const screen=positions.map(p=>project(p,yaw,pitch,zoom));
  const home=base.map(p=>project(p,yaw,pitch,zoom));

  // Each SVG owns its gradients so embedded explorers do not collide on IDs.
  if(!svg.dataset.sceneId)svg.dataset.sceneId='nm-'+(++sceneNumber);
  const prefix=svg.dataset.sceneId;
  const defs=node('defs');
  if(!diagram){
    const tones={
      C:['#858e9c','#414d5d','#273342'],
      O:['#f58277','#b84036','#672521'],
      N:['#7baaf4','#205aa5','#142d62'],
      H:['#ffffff','#e6eaf0','#a1a9b7']
    };
    for(const [symbol,colors] of Object.entries(tones)){
      const gradient=node('radialGradient',{id:prefix+'-'+symbol,cx:'27%',cy:'22%',r:'78%',fx:'25%',fy:'20%'});
      [0,52,100].forEach((offset,i)=>gradient.append(node('stop',{offset:offset+'%','stop-color':colors[i]})));
      defs.append(gradient);
    }
  }
  scene.append(defs);

  const ghost=node('g',{'aria-hidden':'true'});
  scene.append(ghost);
  if(equilibrium){
    for(const [i,j] of molecule.bonds){
      ghost.append(node('line',{x1:home[i].x,y1:home[i].y,x2:home[j].x,y2:home[j].y,stroke:'#66829c','stroke-opacity':.32,'stroke-width':2,'stroke-dasharray':'6 5'}));
    }
    for(const pos of home){
      ghost.append(node('circle',{cx:pos.x,cy:pos.y,r:(diagram?12:17)*pos.perspective,fill:'none',stroke:'#66829c','stroke-opacity':.48,'stroke-width':2,'stroke-dasharray':'4 4'}));
    }
  }

  // Split bonds into near/far halves and depth-sort against the atoms.
  // This prevents front sticks from appearing behind every sphere.
  const sceneObjects=[];
  for(const [i,j] of molecule.bonds){
    const a=screen[i],b=screen[j];
    const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2,z:(a.z+b.z)/2,perspective:(a.perspective+b.perspective)/2};
    for(const [from,to] of [[a,mid],[mid,b]]){
      const depth=(from.z+to.z)/2;
      const opacity=Math.max(.55,Math.min(1,.82+depth*.17));
      const strokeWidth=(diagram?7:16)*((from.perspective+to.perspective)/2);
      sceneObjects.push({depth,draw:()=>{
        const g=node('g',{opacity});
        g.append(node('line',{x1:from.x,y1:from.y,x2:to.x,y2:to.y,stroke:diagram?'#5f748e':'#48596c','stroke-width':strokeWidth,'stroke-linecap':'round'}));
        if(!diagram)g.append(node('line',{x1:from.x-1,y1:from.y-1,x2:to.x-1,y2:to.y-1,stroke:'#d5e1ed','stroke-width':strokeWidth*.36,'stroke-linecap':'round','stroke-opacity':.9}));
        return g;
      }});
    }
  }
  for(let i=0;i<screen.length;i++){
    const pos=screen[i],element=molecule.atoms[i].element;
    const style=ELEMENTS[element],size=(diagram?15:style.radius)*pos.perspective;
    sceneObjects.push({depth:pos.z,draw:()=>{
      const group=node('g');
      group.append(node('circle',{cx:pos.x,cy:pos.y,r:size,fill:diagram?'#f9fbfe':'url(#'+prefix+'-'+element+')',stroke:diagram?style.color:'#344458','stroke-width':diagram?2.8:1.35}));
      if(diagram){
        group.append(node('circle',{cx:pos.x,cy:pos.y,r:size*.58,fill:style.color,'fill-opacity':.07}));
      }
      group.append(node('text',{x:pos.x,y:pos.y+size*.23,'text-anchor':'middle','font-size':(diagram?14.5:16)*pos.perspective,'font-family':'system-ui, sans-serif','font-weight':750,fill:diagram?style.color:style.text},element));
      return group;
    }});
  }
  sceneObjects.sort((a,b)=>a.depth-b.depth);
  const geometry=node('g',{'aria-hidden':'true'});
  for(const object of sceneObjects)geometry.append(object.draw());
  scene.append(geometry);

  if(arrows||diagram){
    const vectors=node('g',{'aria-hidden':'true'});
    for(let i=0;i<mode.displacement.length;i++){
      const start=home[i];
      const end=project(add(base[i],scale(mode.displacement[i],Math.max(.55,amplitude)*1.9)),yaw,pitch,zoom);
      const vx=end.x-start.x,vy=end.y-start.y,len=Math.hypot(vx,vy);
      if(len<10)continue;
      const ox=vx/len,oy=vy/len;
      const headLength=Math.min(14,len*.37);
      const headHalfWidth=Math.min(5.5,headLength*.44);
      // Stop the shaft *inside the broad part of the arrowhead*, not at its tip.
      // This avoids a protruding shaft, including when the line has a thick stroke.
      const sx=start.x+ox*7,sy=start.y+oy*7;
      const tx=end.x,ty=end.y;
      const shaftX=tx-ox*headLength*.8,shaftY=ty-oy*headLength*.8;
      const leftX=tx-ox*headLength-oy*headHalfWidth;
      const leftY=ty-oy*headLength+ox*headHalfWidth;
      const rightX=tx-ox*headLength+oy*headHalfWidth;
      const rightY=ty-oy*headLength-ox*headHalfWidth;
      const color='#087b49';
      vectors.append(node('line',{x1:sx,y1:sy,x2:shaftX,y2:shaftY,stroke:color,'stroke-width':diagram?3.8:3.2,'stroke-linecap':'butt'}));
      vectors.append(node('polygon',{points:tx+','+ty+' '+leftX+','+leftY+' '+rightX+','+rightY,fill:color}));
    }
    scene.append(vectors);
  }
}

function attachNormalModes(root){
  let molecule=findMolecule(root.dataset.molecule);
  let mode=molecule.modes.find(m=>m.id===root.dataset.mode)||molecule.modes[0];
  let running=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase=0,amplitude=1,speed=1,yaw=cameraFor(molecule).yaw,pitch=cameraFor(molecule).pitch;
  let visible=true,frame=0,last=0;
  const el=name=>root.querySelector('[data-nm="'+name+'"]');
  const moleculeInput=el('molecule'),modeInput=el('mode'),viewInput=el('view');
  const amplitudeInput=el('amplitude'),speedInput=el('speed');
  const arrowsInput=el('arrows'),eqInput=el('equilibrium');
  const playButton=el('play');
  const views=el('visuals');
  const ball=el('ball'),diagram=el('diagram');
  const angleAtoms=()=>molecule.angle;
  moleculeInput.value=molecule.id;

  function fillModes(requested){
    modeInput.replaceChildren();
    for(const m of molecule.modes){
      const option=document.createElement('option');
      option.value=m.id;
      option.textContent=m.group+' · '+m.name;
      modeInput.append(option);
    }
    mode=molecule.modes.find(m=>m.id===requested)||molecule.modes[0];
    modeInput.value=mode.id;
  }

  function updateFacts(){
    const d=degrees(molecule);
    const axisView=el('axis-view');
    if(axisView)axisView.hidden=molecule.id!=='nh3';
    setText(root,'group',molecule.formula+' / '+mode.group+' / '+mode.kind.toUpperCase());
    setText(root,'title',mode.name);
    setText(root,'description',mode.description);
    setText(root,'symmetry',mode.symmetry+' · '+molecule.pointGroup);
    setClass(el('ir'),mode.ir);
    setClass(el('raman'),mode.raman);
    setText(root,'frequency',mode.id==='co2-sym'?'≈ 1333 cm⁻¹ (uncoupled)':'≈ '+mode.frequency+' cm⁻¹');
    setText(root,'degeneracy',mode.degeneracy===1?'Nondegenerate normal coordinate.':'Component '+mode.partner+' of '+mode.degeneracy+' degenerate coordinates; equivalent mixtures are also possible.');
    setText(root,'angle-label',molecule.angleLabel+' angle');
    const pair=molecule.bonds[0];
    setText(root,'bond-label',molecule.atoms[pair[0]].element+'–'+molecule.atoms[pair[1]].element+' bond');
    setText(root,'formula',d.total+' − 3 − '+d.rotations+' = '+d.vibrations);
    setText(root,'count-explanation',molecule.atoms.length+' atoms × 3 Cartesian coordinates = '+d.total+' total. Subtract 3 translations and '+d.rotations+' rotations because '+molecule.formula+' is '+(molecule.linear?'linear.':'nonlinear.')+(molecule.id==='nh3'?' In NH₃, the 3D H–N–H equilibrium angle is 106.7°, although the hydrogens are 120° apart around the symmetry axis.':''));
    setText(root,'rot-count',String(d.rotations));
    setText(root,'vib-count',String(d.vibrations));
    const setWidth=(name,value)=>{el(name).style.width=(100*value/d.total)+'%';};
    setWidth('trans-bar',3);setWidth('rot-bar',d.rotations);setWidth('vib-bar',d.vibrations);
    const inversion=molecule.id==='co2';
    setText(root,'selection-note',inversion?'CO₂ has an inversion center: IR-active fundamentals are Raman-inactive, and vice versa.':'IR and Raman activity are determined by the mode symmetry and the dipole/polarizability transformation properties; molecular polarity alone is insufficient.');
  }

  function draw(){
    const positions=displacedPositions(molecule,mode,Math.sin(phase),amplitude);
    renderMolecule(ball,molecule,mode,Math.sin(phase),amplitude,yaw,pitch,arrowsInput.checked,eqInput.checked,false);
    renderMolecule(diagram,molecule,mode,Math.sin(phase),amplitude,yaw,pitch,arrowsInput.checked,eqInput.checked,true);
    const [a,b,c]=angleAtoms();
    setText(root,'angle-value',bondAngle(positions[a],positions[b],positions[c]).toFixed(1)+'°');
    const bond=molecule.bonds[0];
    setText(root,'bond-value',distance(positions[bond[0]],positions[bond[1]]).toFixed(3)+' Å');
  }

  function updatePlay(){
    playButton.textContent=running?'Pause animation':'Play animation';
  }

  function updateView(){views.dataset.view=viewInput.value;draw();}
  moleculeInput.addEventListener('change',()=>{
    molecule=findMolecule(moleculeInput.value);
    yaw=cameraFor(molecule).yaw;pitch=cameraFor(molecule).pitch;
    fillModes();
    phase=0;updateFacts();draw();
  });
  modeInput.addEventListener('change',()=>{
    mode=molecule.modes.find(m=>m.id===modeInput.value)||molecule.modes[0];
    phase=0;updateFacts();draw();
  });
  amplitudeInput.addEventListener('input',()=>{
    amplitude=Number(amplitudeInput.value);
    setText(root,'amplitude-value',amplitude.toFixed(1)+'×');draw();
  });
  speedInput.addEventListener('input',()=>{
    speed=Number(speedInput.value);
    setText(root,'speed-value',speed.toFixed(1)+'×');
  });
  for(const input of [arrowsInput,eqInput])input.addEventListener('change',draw);
  viewInput.addEventListener('change',updateView);
  playButton.addEventListener('click',()=>{running=!running;updatePlay();draw();});
  const resetView=el('reset-view');
  if(resetView)resetView.addEventListener('click',()=>{yaw=cameraFor(molecule).yaw;pitch=cameraFor(molecule).pitch;draw();});
  const axisView=el('axis-view');
  if(axisView)axisView.addEventListener('click',()=>{yaw=0;pitch=0;draw();});
  for(const svg of [ball,diagram]){
    let drag=null;
    svg.addEventListener('pointerdown',e=>{
      drag={x:e.clientX,y:e.clientY,yaw,pitch};
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove',e=>{
      if(!drag)return;
      yaw=drag.yaw+(e.clientX-drag.x)*.009;
      pitch=Math.max(-1.4,Math.min(1.4,drag.pitch+(e.clientY-drag.y)*.009));
      draw();
    });
    const end=()=>{drag=null;};
    svg.addEventListener('pointerup',end);
    svg.addEventListener('pointercancel',end);
    svg.addEventListener('lostpointercapture',end);
  }

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'});
    observer.observe(root);
  }
  function animate(time){
    if(!root.isConnected)return;
    if(last&&running&&visible&&!document.hidden){
      phase+=Math.min(55,time-last)*.0038*speed;
      draw();
    }
    last=time;
    frame=requestAnimationFrame(animate);
  }
  fillModes(mode.id);
  updateFacts();updatePlay();updateView();
  frame=requestAnimationFrame(animate);
}

document.querySelectorAll('[data-normal-modes]').forEach(attachNormalModes);
