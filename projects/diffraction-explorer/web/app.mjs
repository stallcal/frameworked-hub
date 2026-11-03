import {bragg,VERSION} from './model.mjs';
const $=id=>document.getElementById(id),number=id=>$(id).value.trim()===''?NaN:Number($(id).value);
const fmt=x=>Number(x.toPrecision(7)).toString();
let result;
function update(){
  $('value-label').textContent={spacing:'Plane spacing d (Å)',angle:'Diffraction angle 2θ (°)',q:'Scattering vector q (Å⁻¹)'}[$('mode').value];
  $('spacing-slider').hidden=$('mode').value!=='spacing';
  if($('mode').value==='spacing')$('spacing-slider').value=$('value').value;
  try{
    result=bragg({mode:$('mode').value,value:number('value'),wavelength:number('wavelength'),order:number('order')});
    $('error').textContent='';$('results').hidden=false;
    $('angle-out').textContent=fmt(result.twoTheta);$('d-out').textContent=fmt(result.spacing);$('q-out').textContent=fmt(result.q);
    $('explanation').textContent=`θ = ${fmt(result.theta)}°. The path difference is nλ = ${fmt(result.pathDifference)} Å. At this angle, the extra path equals ${result.order} wavelength${result.order===1?'':'s'}.`;
    const angle=result.theta*Math.PI/180,cx=300,y=200,gap=Math.min(150,Math.max(55,result.spacing*25)),length=190;
    const ray=(yy,color)=>`<path d="M ${cx-length*Math.cos(angle)} ${yy-length*Math.sin(angle)} L ${cx} ${yy} L ${cx+length*Math.cos(angle)} ${yy-length*Math.sin(angle)}" fill="none" stroke="${color}" stroke-width="4" marker-end="url(#arrow-${color==='#084b9e'?'blue':'red'})"/>`;
    $('geometry').innerHTML=`<defs><marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#084b9e"/></marker><marker id="arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#9e382e"/></marker></defs><g stroke="#a8b6c8" stroke-width="2"><path d="M45 ${y}H710M45 ${y+gap}H710"/></g>${ray(y,'#084b9e')}${ray(y+gap,'#9e382e')}<g fill="#1c3049" font-size="18" font-family="Georgia,serif"><text x="48" y="390">Incident and diffracted rays at θ = ${fmt(result.theta)}° to each plane</text><text x="660" y="${y+gap/2}" text-anchor="middle">d</text><text x="460" y="38">nλ = ${fmt(result.pathDifference)} Å</text></g><path d="M650 ${y}V${y+gap}M640 ${y}H660M640 ${y+gap}H660" fill="none" stroke="#1c3049" stroke-width="2"/>`;
  }catch(e){result=null;$('results').hidden=true;$('error').textContent=e.message;}
}
for(const id of ['value','wavelength','order'])$(id).addEventListener('input',()=>{if(id==='wavelength')$('preset').value='custom';update();});
$('mode').addEventListener('change',()=>{$('value').value={spacing:result?.spacing??3,angle:result?.twoTheta??30,q:result?.q??2}[$('mode').value];update();});
$('spacing-slider').addEventListener('input',()=>{$('value').value=$('spacing-slider').value;update();});
$('preset').addEventListener('change',()=>{if($('preset').value!=='custom')$('wavelength').value=$('preset').value;update();});
$('reset').addEventListener('click',()=>{$('mode').value='spacing';$('value').value=3;$('wavelength').value=1.5406;$('preset').value='1.5406';$('order').value=1;update();});
$('export').addEventListener('click',()=>{if(!result)return;const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({tool:'Frameworked Bragg explorer',version:VERSION,units:{spacing:'Å',wavelength:'Å',angles:'degrees',q:'Å^-1'},...result,model:'Bragg geometry; no intensity or structure-factor prediction'},null,2)],{type:'application/json'}));a.href=url;a.download='bragg-calculation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
update();
