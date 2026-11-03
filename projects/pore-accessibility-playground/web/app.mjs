import {analyze,clearance,PRESETS,WIDTH,HEIGHT,VERSION} from './model.mjs';
const $=id=>document.getElementById(id),number=id=>$(id).value.trim()===''?NaN:Number($(id).value);
const canvas=$('pore'),ctx=canvas.getContext('2d');let result;
function draw(){if(!result||!ctx)return;const sx=canvas.width/WIDTH,sy=canvas.height/HEIGHT;
  ctx.fillStyle='#d9e0e8';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<result.ny;y++)for(let x=0;x<result.nx;x++){const state=result.mask[y*result.nx+x];if(state){ctx.fillStyle=state===2?'#084b9e':'#9e382e';ctx.fillRect(x*result.dx*sx,y*result.dy*sy,result.dx*sx+.15,result.dy*sy+.15);}}
  ctx.fillStyle='#1c3049';for(const o of PRESETS[$('preset').value].obstacles)ctx.fillRect(o.x*sx,o.y*sy,o.w*sx,o.h*sy);
  const x=number('probe-x'),y=number('probe-y');
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>WIDTH||y<0||y>HEIGHT){$('inspection').textContent='Choose a location inside the 120 × 80 model.';return;}
  ctx.beginPath();ctx.arc(x*sx,y*sy,result.radius*sx,0,2*Math.PI);ctx.fillStyle='#089e4b';ctx.globalAlpha=.7;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#f7f9fc';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(x*sx,y*sy,2,0,2*Math.PI);ctx.fillStyle='#f7f9fc';ctx.fill();
  const cell=result.mask[Math.min(result.ny-1,Math.floor(y/result.dy))*result.nx+Math.min(result.nx-1,Math.floor(x/result.dx))];
  const free=clearance(x,y,PRESETS[$('preset').value].obstacles)>result.radius;
  $('inspection').textContent=`At (${x.toFixed(1)}, ${y.toFixed(1)}): `+(!free?'the probe touches or overlaps a wall or obstacle.':cell===2?'this cell is connected to the left inlet.':cell===1?'the probe fits, but this cell has no inlet connection on the current grid.':'the center fits geometrically, but this cell is excluded by the conservative grid margin. Try a finer grid.');
}
function update(){try{
  const radius=number('radius');if(radius>30)throw Error('For this model choose a radius from 0 to 30.');
  result=analyze({obstacles:PRESETS[$('preset').value].obstacles,radius,step:number('resolution')});$('error').textContent='';$('results').hidden=false;
  $('preset-description').textContent=PRESETS[$('preset').value].description;
  $('through').textContent=result.through?'Connected':'Not resolved';
  $('accessible').textContent=(100*result.accessibleArea/(WIDTH*HEIGHT)).toFixed(1);
  $('isolated').textContent=(100*result.isolated*result.dx*result.dy/(WIDTH*HEIGHT)).toFixed(1);
  $('grid-note').textContent=`${result.nx} × ${result.ny} cells. Conservative clearance margin: ${result.margin.toFixed(3)} model units beyond the probe radius. Areas refer to allowed probe centers, not physical pore volume.`;
  draw();
}catch(e){result=null;$('results').hidden=true;$('error').textContent=e.message;}}
for(const id of ['preset','radius','resolution'])$(id).addEventListener('input',()=>{if(id==='radius')$('radius-slider').value=$('radius').value;update();});
$('radius-slider').addEventListener('input',()=>{$('radius').value=$('radius-slider').value;update();});
for(const id of ['probe-x','probe-y'])$(id).addEventListener('input',draw);
canvas.addEventListener('click',e=>{const rect=canvas.getBoundingClientRect();$('probe-x').value=((e.clientX-rect.left)*WIDTH/rect.width).toFixed(1);$('probe-y').value=((e.clientY-rect.top)*HEIGHT/rect.height).toFixed(1);draw();});
$('reset').addEventListener('click',()=>{$('preset').value='channel';$('radius').value=3;$('radius-slider').value=3;$('resolution').value='1';$('probe-x').value=60;$('probe-y').value=40;update();});
$('export').addEventListener('click',()=>{if(!result)return;const {mask,...summary}=result;const data={tool:'Frameworked pore playground',version:VERSION,preset:$('preset').value,obstacles:PRESETS[$('preset').value].obstacles,...summary,units:'arbitrary model units',boundary:'left/right open; top/bottom solid',method:'four-neighbor connectivity; clearance inflated by half a cell diagonal; conservative grid estimate'};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='pore-model.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
update();
