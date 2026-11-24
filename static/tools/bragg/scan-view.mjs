import {bragg,squareLatticeSpacing} from "./model.mjs";
import {finitePlaneInterference,finitePlaneScan,predictedBraggOrders} from "./scan-model.mjs";
const el=id=>document.getElementById(id);
const num=id=>el(id).value.trim()===""?NaN:Number(el(id).value);
const f=(v,n=2)=>Number(v).toFixed(n);
let selected=22.2, peaks=[], curve=[], key="", choicesKey="";
let follow=true;
function conditions(){
  const wavelength=num("wavelength");
  let spacing;
  if(!el("advancedPanel").open){
    const a=num("latticeA");
    if(!Number.isFinite(a)||a<2||a>12) throw Error("Choose a lattice parameter from 2 to 12 Å.");
    spacing=squareLatticeSpacing({a,plane:el("planeFamily").value}).d;
  } else if(el("mode").value==="spacing") {
    // d is still meaningful when the chosen Bragg order is not physically reachable.
    spacing=num("value");
  } else {
    spacing=bragg({mode:el("mode").value,value:num("value"),wavelength,order:num("order")}).spacing;
  }
  if(![spacing,wavelength].every(Number.isFinite)||spacing<=0||wavelength<=0)
    throw Error("Enter a positive plane spacing and wavelength.");
  return {spacing,wavelength,planes:Number(el("scanPlanes").value)};
}
function plot(points,result,orders){
  const x=a=>48+340*a/120,y=i=>174-146*i;
  const svg=[];
  for(const level of [0,.5,1]){
    svg.push('<path d="M48 '+y(level)+'H388" stroke="#ccd9e8" fill="none"/><text x="39" y="'+(y(level)+4)+'" text-anchor="end">'+level+'</text>');
  }
  for(const a of [0,30,60,90,120]){
    svg.push('<path d="M'+x(a)+' 174v5" stroke="#1c3049"/><text x="'+x(a)+'" y="196" text-anchor="middle">'+a+'°</text>');
  }
  svg.push('<path d="M48 28V174H388" fill="none" stroke="#1c3049"/>');
  svg.push('<path d="'+points.map((p,i)=>(i?"L":"M")+f(x(p.twoTheta))+" "+f(y(p.normalizedIntensity))).join(" ")+'" stroke="#084b9e" stroke-width="2" stroke-linejoin="round" fill="none"/>');
  for(const p of orders){
    svg.push('<path d="M'+f(x(p.twoTheta))+' 28V174" stroke="#087e48" stroke-dasharray="3 4" opacity=".7"/><circle cx="'+f(x(p.twoTheta))+'" cy="28" r="3" fill="#087e48"/>');
  }
  svg.push('<path d="M'+f(x(result.twoTheta))+' 28V174" stroke="#9e382e" stroke-width="2"/><circle cx="'+f(x(result.twoTheta))+'" cy="'+f(y(result.normalizedIntensity))+'" r="4.5" fill="#9e382e" stroke="white"/>');
  svg.push('<text x="218" y="216" text-anchor="middle">Scattering angle, 2θ</text><text x="13" y="100" transform="rotate(-90 13 100)" text-anchor="middle">Relative response</text>');
  el("scanIntensity").innerHTML=svg.join("");
}
function vectors(result){
  const scale=112/result.planes,ox=148,oy=148;
  let x=ox,y=oy;
  const out=['<circle cx="148" cy="148" r="112" fill="none" stroke="#ccd9e8" stroke-dasharray="4 5"/>','<path d="M26 148H270M148 26V270" stroke="#e0e8f0"/>'];
  for(const p of result.phasors){
    const nx=x+scale*p.real,ny=y-scale*p.imag;
    out.push('<path d="M'+f(x)+' '+f(y)+'L'+f(nx)+' '+f(ny)+'" stroke="#084b9e" stroke-width="2.5" marker-end="url(#scanVectorTip)" fill="none"/>');
    x=nx;y=ny;
  }
  out.unshift('<defs><marker id="scanVectorTip" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L4 2.5L0 5Z" fill="#084b9e"/></marker></defs>');
  out.push('<path d="M148 148L'+f(x)+' '+f(y)+'" stroke="#9e382e" stroke-width="3.5" stroke-dasharray="6 4" fill="none"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="4" fill="#9e382e"/><circle cx="148" cy="148" r="3" fill="#1c3049"/>');
  el("scanPhasors").innerHTML=out.join("");
}
function render(){
  try{
    const c=conditions();
    const nextKey=[c.spacing,c.wavelength,c.planes].join("|");
    if(key!==nextKey){
      const nextPeaks=predictedBraggOrders(c);
      const nextCurve=finitePlaneScan(c);
      peaks=nextPeaks;curve=nextCurve;key=nextKey;
    }
    const selector=el("scanPeakSelect"),prior=Number(selector.value);
    const nextChoices=peaks.map(p=>p.order+":"+p.twoTheta).join("|");
    if(choicesKey!==nextChoices||!selector.innerHTML){
      selector.innerHTML=peaks.length?peaks.map(p=>'<option value="'+p.order+'">n = '+p.order+' · '+f(p.twoTheta,3)+'°</option>').join(""):'<option value="">No positive order in range</option>';
      selector.value=String(peaks.some(p=>p.order===prior)?prior:peaks[0]?.order??"");
      choicesKey=nextChoices;
    }
    selector.disabled=el("scanSnap").disabled=!peaks.length;
    if(follow&&peaks.length){
      selected=(peaks.find(p=>p.order===Number(selector.value))??peaks[0]).twoTheta;
    }
    el("scanTwoTheta").value=String(selected);
    const r=finitePlaneInterference({...c,twoTheta:selected});
    el("scanAngleValue").textContent=f(selected,3)+"°";
    el("scanPlanesValue").textContent=String(c.planes);
    el("scanResponse").textContent=f(r.normalizedIntensity*100,2)+"%";
    el("scanContext").textContent="d = "+f(c.spacing,3)+" Å · λ = "+f(c.wavelength,4)+" Å · adjacent path difference = "+f(r.cycles,4)+"λ";
    el("scanObservation").textContent=r.normalizedIntensity>0.99?"The contributions nearly align and reinforce.":r.normalizedIntensity<0.01?"The contributions nearly cancel.":"The contributions partially reinforce or cancel.";
    el("scanPeakNote").textContent=peaks.length?peaks.length+" positive-order Bragg positions in the displayed range.":"No positive-order Bragg position in this range; 0° is forward scattering.";
    el("scanError").textContent="";el("scanPanels").hidden=false;
    plot(curve,r,peaks);vectors(r);
  }catch(e){
    key="";el("scanError").textContent=e.message;el("scanPanels").hidden=true;
    el("scanPeakSelect").disabled=el("scanSnap").disabled=true;
  }
}
el("scanTwoTheta").addEventListener("input",()=>{selected=Number(el("scanTwoTheta").value);follow=false;render();});
el("scanPlanes").addEventListener("input",render);
el("scanPeakSelect").addEventListener("change",()=>{follow=false;});
el("scanSnap").addEventListener("click",()=>{if(peaks.length){follow=true;render();}});
for(const id of ["latticeA","latticeSlider","planeFamily","wavelength","preset","mode","value","order","spacing-slider"]){
  el(id).addEventListener("input",render);el(id).addEventListener("change",render);
}
el("advancedPanel").addEventListener("toggle",render);
for(const id of ["reset","tryMeasuredPeak"]) el(id).addEventListener("click",()=>{follow=true;el("scanPlanes").value="8";el("scanPeakSelect").value="1";selected=22.2;render();});
render();
