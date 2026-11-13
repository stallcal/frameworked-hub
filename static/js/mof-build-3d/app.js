import {STAGES} from './model.js';

// Load the 3D engine only near the article figure. A static explanatory image
// remains available if WebGL or the pinned module CDN cannot be used.
function attach(root){
  const q=selector=>root.querySelector(selector);
  const mount=q('[data-3d-mount]');
  const loader=q('[data-3d-status]');
  const fallback=q('[data-3d-fallback]');
  const stageButtons=[...root.querySelectorAll('[data-3d-stage]')];
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
  if(![mount,loader,fallback,output,step,title,description,pore,poreNote,
    focus,reset,turnLeft,turnRight,help].every(Boolean) ||
    stageButtons.length!==STAGES.length ||
    stageButtons.some((button,i)=>Number(button.dataset.stageInvalid ?? button.dataset['3dStage'])!==i))return;

  let viewer=null;
  let currentStage=0;
  let loading=false;
  let loadFailed=false;

  const updatePore=()=>{
    const visible=currentStage>0 && pore.checked;
    pore.disabled=currentStage===0;
    poreNote.hidden=!visible;
    focus.disabled=!(visible&&viewer);
    focus.hidden=!(visible&&viewer);
    viewer?.setPore(visible);
    help.textContent=currentStage===0
      ? 'Select 1×1×1 to build the first open block.'
      : visible
        ? 'The opaque sphere fills much of one schematic cavity. Focus on pore moves the camera closer.'
        : 'Drag to rotate · pinch or scroll to zoom · use the turn buttons with a keyboard.';
  };

  function selectStage(n){
    if(!Number.isInteger(n)||n<0||n>=STAGES.length)return;
    currentStage=n;
    if(n===0)pore.checked=false;
    stageButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===n)));
    output.textContent=STAGES[n].label;
    title.textContent=STAGES[n].title;
    description.textContent=STAGES[n].explanation;
    step.textContent=['01 / PIECES','02 / ONE BLOCK','03 / EIGHT BLOCKS','04 / TWENTY-SEVEN BLOCKS'][n];
    if(viewer)viewer.rebuild(n);
    updatePore();
  }

  stageButtons.forEach((button,i)=>button.addEventListener('click',()=>selectStage(i)));
  pore.addEventListener('change',updatePore);
  focus.addEventListener('click',()=>viewer?.focusPore());
  turnLeft.addEventListener('click',()=>viewer?.rotate(-Math.PI/6));
  turnRight.addEventListener('click',()=>viewer?.rotate(Math.PI/6));
  reset.addEventListener('click',()=>{
    pore.checked=false;
    selectStage(0);
    viewer?.frame(true);
    stageButtons[0].focus();
  });

  async function hydrate(){
    if(loading||viewer||loadFailed)return;
    loading=true;
    loader.hidden=false;
    loader.textContent='Loading the 3D viewer…';
    try{
      const {createMofScene}=await import('./scene.js');
      viewer=createMofScene(mount);
      viewer.rebuild(currentStage);
      fallback.hidden=true;
      loader.hidden=true;
      turnLeft.disabled=false;
      turnRight.disabled=false;
      updatePore();
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
        turnLeft.disabled=true;
        turnRight.disabled=true;
        focus.hidden=true;
        focus.disabled=true;
      });
      const visibility=()=>viewer?.setVisible(!document.hidden);
      document.addEventListener('visibilitychange',visibility);
      visibility();
    }catch(err){
      loadFailed=true;
      fallback.hidden=false;
      loader.hidden=false;
      loader.textContent='3D is unavailable here. The static building-block diagram and written explanation are still available.';
      turnLeft.disabled=true;
      turnRight.disabled=true;
      focus.hidden=true;
      focus.disabled=true;
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
  selectStage(0);
}
document.querySelectorAll('[data-mof-build-3d]').forEach(attach);
