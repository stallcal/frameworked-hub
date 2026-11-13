import {STAGES} from './model.js';

// One-shot, in-view hydration. Three.js is not downloaded for a reader who
// never reaches the figure. The SVG fallback remains usable if WebGL or CDN fails.
function attach(root){
  const q=selector=>root.querySelector(selector);
  const mount=q('[data-3d-mount]');
  const loader=q('[data-3d-status]');
  const fallback=q('[data-3d-fallback]');
  const range=q('[data-3d-range]');
  const output=q('[data-3d-output]');
  const step=q('[data-3d-step]');
  const title=q('[data-3d-title]');
  const description=q('[data-3d-explanation]');
  const pore=q('[data-3d-pore]');
  const poreNote=q('[data-3d-pore-note]');
  const focus=q('[data-3d-focus]');
  const reset=q('[data-3d-reset]');
  const turnLeft=q('[data-3d-left]');
  const turnRight=q('[data-3d-right]');
  const help=q('[data-3d-help]');
  if(![mount,loader,fallback,range,output,step,title,description,pore,poreNote,
    focus,reset,turnLeft,turnRight,help].every(Boolean))return;

  let viewer=null;
  let loading=false;
  let loadFailed=false;
  const update=()=>{
    const n=Number(range.value);
    if(!Number.isInteger(n)||n<0||n>3)return;
    if(n===0)pore.checked=false;
    pore.disabled=n===0;
    output.textContent=STAGES[n].label;
    range.setAttribute('aria-valuetext',STAGES[n].label);
    title.textContent=STAGES[n].title;
    description.textContent=STAGES[n].explanation;
    step.textContent=['01 / PIECES','02 / ONE BLOCK','03 / EIGHT BLOCKS','04 / TWENTY-SEVEN BLOCKS'][n];
    poreNote.hidden=!(pore.checked&&n>0);
    focus.disabled=!(pore.checked&&n>0&&viewer);
    help.textContent=n===0
      ? 'Move the slider to build the first open block.'
      : pore.checked
        ? 'The sphere is proportional to this illustrative network. Use Focus on pore for a closer look.'
        : 'Drag to rotate · pinch or scroll to zoom · turn buttons work with a keyboard.';
    if(viewer){ viewer.rebuild(n);viewer.setPore(pore.checked); }
  };

  range.addEventListener('input',update);
  range.addEventListener('change',update);
  pore.addEventListener('change',()=>{
    const n=Number(range.value);
    poreNote.hidden=!(pore.checked&&n>0);
    focus.disabled=!(pore.checked&&n>0&&viewer);
    if(viewer)viewer.setPore(pore.checked&&n>0);
    help.textContent=pore.checked
      ? 'The sphere is proportional to this illustrative network. Use Focus on pore for a closer look.'
      : 'Drag to rotate · pinch or scroll to zoom · turn buttons work with a keyboard.';
  });
  focus.addEventListener('click',()=>viewer?.focusPore());
  turnLeft.addEventListener('click',()=>viewer?.rotate(-Math.PI/6));
  turnRight.addEventListener('click',()=>viewer?.rotate(Math.PI/6));
  reset.addEventListener('click',()=>{
    range.value='0';
    pore.checked=false;
    update();
    viewer?.frame(true);
    range.focus();
  });

  // This is a static SVG and explanatory copy, not a fake preview of a 3D model.
  async function hydrate(){
    if(loading||viewer||loadFailed)return;
    loading=true;
    loader.hidden=false;
    loader.textContent='Loading the 3D viewer…';
    try{
      const {createMofScene}=await import('./scene.js');
      viewer=createMofScene(mount);
      const current=Number(range.value);
      viewer.rebuild(current);
      viewer.setPore(pore.checked);
      fallback.hidden=true;
      loader.hidden=true;
      focus.disabled=!(pore.checked&&current>0);
      turnLeft.disabled=false;turnRight.disabled=false;
      const canvas=viewer.canvas;
      canvas.addEventListener('keydown',ev=>{
        if(ev.key==='ArrowLeft'||ev.key==='ArrowRight'){
          ev.preventDefault();
          viewer?.rotate(ev.key==='ArrowLeft'?-Math.PI/12:Math.PI/12);
        }
      });
      canvas.addEventListener('webglcontextlost',ev=>{
        ev.preventDefault();
        fallback.hidden=false;
        loader.hidden=false;
        loader.textContent='The 3D drawing lost its graphics context. Reload this page to try again.';
        turnLeft.disabled=true;turnRight.disabled=true;focus.disabled=true;
      });
      const visibility=()=>viewer?.setVisible(!document.hidden);
      document.addEventListener('visibilitychange',visibility);
      // Avoid perpetual animation or GPU work for a hidden page.
      visibility();
    }catch(err){
      loadFailed=true;
      fallback.hidden=false;
      loader.hidden=false;
      loader.textContent='3D is unavailable here. The static building-block diagram and written explanation are still available.';
      turnLeft.disabled=true;turnRight.disabled=true;focus.disabled=true;
      console.warn('Frameworked conceptual 3D figure unavailable:',err);
    }finally{loading=false;}
  }

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){io.disconnect();hydrate();}
    },{rootMargin:'250px 0px'});
    io.observe(root);
  }else{
    hydrate();
  }
  update();
}

document.querySelectorAll('[data-mof-build-3d]').forEach(attach);
