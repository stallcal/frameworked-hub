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
  return {x:320+v[0]*zoom,y:195-v[1]*zoom,z:v[2]};
}
function setText(root,id,value){const element=root.querySelector('[data-nm="'+id+'"]');if(element)element.textContent=value;}
function setClass(el,value){el.classList.remove('nm-yes','nm-no');el.classList.add(value?'nm-yes':'nm-no');el.textContent=value?'Active':'Inactive';}

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
  const back=node('g');
  const bonds=node('g');
  const vectors=node('g');
  const balls=node('g');
  scene.append(back,bonds,vectors,balls);
  if(equilibrium){
    for(const [i,j] of molecule.bonds){
      back.append(node('line',{x1:home[i].x,y1:home[i].y,x2:home[j].x,y2:home[j].y,stroke:'#66829c','stroke-opacity':.38,'stroke-width':2,'stroke-dasharray':'6 5'}));
    }
    for(let i=0;i<home.length;i++){
      back.append(node('circle',{cx:home[i].x,cy:home[i].y,r:diagram?12:17,fill:'none',stroke:'#66829c','stroke-opacity':.5,'stroke-width':2,'stroke-dasharray':'4 4'}));
    }
  }
  const sortedBonds=molecule.bonds.slice().sort((a,b)=>(screen[a[0]].z+screen[a[1]].z)-(screen[b[0]].z+screen[b[1]].z));
  for(const [i,j] of sortedBonds){
    const a=screen[i],b=screen[j];
    bonds.append(node('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,stroke:diagram?'#6a7c90':'#647588','stroke-width':diagram?7:17,'stroke-linecap':'round'}));
    if(!diagram)bonds.append(node('line',{x1:a.x-1,y1:a.y-1,x2:b.x-1,y2:b.y-1,stroke:'#d3dce4','stroke-width':6,'stroke-linecap':'round','stroke-opacity':.85}));
  }
  if(arrows||diagram){
    for(let i=0;i<mode.displacement.length;i++){
      const start=home[i];
      const end=project(add(base[i],scale(mode.displacement[i],Math.max(.55,amplitude)*1.9)),yaw,pitch,zoom);
      const vx=end.x-start.x,vy=end.y-start.y,len=Math.hypot(vx,vy);
      if(len<4)continue;
      const ox=vx/len,oy=vy/len;
      // Direction arrows show the positive normal-coordinate direction, not instantaneous velocity.
      const ax=start.x+ox*8,ay=start.y+oy*8,bx=end.x,by=end.y;
      vectors.append(node('line',{x1:ax,y1:ay,x2:bx,y2:by,stroke:'#087b49','stroke-width':diagram?3.8:3.2,'stroke-linecap':'round'}));
      const tip=bx+','+by+' '+(bx-ox*12-oy*5)+','+(by-oy*12+ox*5)+' '+(bx-ox*12+oy*5)+','+(by-oy*12-ox*5);
      vectors.append(node('polygon',{points:tip,fill:'#087b49'}));
    }
  }
  const order=screen.map((p,i)=>({p,i})).sort((a,b)=>a.p.z-b.p.z);
  for(const {p,i} of order){
    const element=molecule.atoms[i].element;
    const style=ELEMENTS[element];
    const size=diagram?15:style.radius;
    const group=node('g');
    group.append(node('circle',{cx:p.x,cy:p.y,r:size,fill:diagram?'#f9fbfe':style.color,stroke:diagram?style.color:'#31465b','stroke-width':diagram?3:1.5}));
    if(!diagram){
      group.append(node('circle',{cx:p.x-size*.27,cy:p.y-size*.32,r:size*.36,fill:'#ffffff','fill-opacity':element==='H'?.62:.24}));
      group.append(node('ellipse',{cx:p.x+size*.12,cy:p.y+size*.65,rx:size*.45,ry:size*.17,fill:'#000000','fill-opacity':.10}));
    }
    group.append(node('text',{x:p.x,y:p.y+4.8,'text-anchor':'middle','font-size':diagram?15:16,'font-family':'system-ui, sans-serif','font-weight':750,fill:diagram?style.color:style.text},element));
    balls.append(group);
  }
}

function attachNormalModes(root){
  let molecule=findMolecule(root.dataset.molecule);
  let mode=molecule.modes.find(m=>m.id===root.dataset.mode)||molecule.modes[0];
  let running=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let phase=0,amplitude=1,speed=1,yaw=.36,pitch=-.24;
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
    setText(root,'group',molecule.formula+' / '+mode.group+' / '+mode.kind.toUpperCase());
    setText(root,'title',mode.name);
    setText(root,'description',mode.description);
    setText(root,'symmetry',mode.symmetry+' · '+molecule.pointGroup);
    setClass(el('ir'),mode.ir);
    setClass(el('raman'),mode.raman);
    setText(root,'frequency','≈ '+mode.frequency+' cm⁻¹');
    setText(root,'degeneracy',mode.degeneracy===1?'Nondegenerate normal coordinate.':'Component '+mode.partner+' of '+mode.degeneracy+' degenerate coordinates; equivalent mixtures are also possible.');
    setText(root,'angle-label',molecule.angleLabel+' angle');
    const pair=molecule.bonds[0];
    setText(root,'bond-label',molecule.atoms[pair[0]].element+'–'+molecule.atoms[pair[1]].element+' bond');
    setText(root,'formula',d.total+' − 3 − '+d.rotations+' = '+d.vibrations);
    setText(root,'count-explanation',molecule.atoms.length+' atoms × 3 Cartesian coordinates = '+d.total+' total. Subtract 3 translations and '+d.rotations+' rotations because '+molecule.formula+' is '+(molecule.linear?'linear.':'nonlinear.'));
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
    playButton.setAttribute('aria-pressed',String(!running));
  }

  function updateView(){views.dataset.view=viewInput.value;draw();}
  moleculeInput.addEventListener('change',()=>{
    molecule=findMolecule(moleculeInput.value);
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
