import {bragg,squareLatticeSpacing} from "./model.mjs";
import {finitePlaneInterference,finitePlaneScan,predictedBraggOrders} from "./scan-model.mjs";
const el=id=>document.getElementById(id);
const num=id=>el(id).value.trim()===""?NaN:Number(el(id).value);
const f=(v,n=2)=>Number(v).toFixed(n);
let selected=22.2, peaks=[], curve=[], key="", choicesKey="";
let follow=false, initializeNearPeak=true;
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
  const segments=[], joints=[];
  for(const p of result.phasors){
    const nx=x+scale*p.real,ny=y-scale*p.imag;
    segments.push('<path class="scan-contribution" d="M'+f(x)+' '+f(y)+'L'+f(nx)+' '+f(ny)+'" stroke="#084b9e" stroke-width="2.5" marker-end="url(#scanVectorTip)" fill="none"/>');
    joints.push('<circle class="scan-joint" cx="'+f(nx)+'" cy="'+f(ny)+'" r="1.8" fill="white" stroke="#084b9e" stroke-width="1"/>');
    x=nx;y=ny;
  }
  out.unshift('<defs><marker id="scanVectorTip" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L4 2.5L0 5Z" fill="#084b9e"/></marker></defs>');
  out.push('<path class="scan-resultant" d="M148 148L'+f(x)+' '+f(y)+'" stroke="#9e382e" stroke-width="6" stroke-dasharray="6 4" fill="none"/>',...segments,...joints,'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="4" fill="#9e382e"/><circle cx="148" cy="148" r="3" fill="#1c3049"/>');
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
    if(initializeNearPeak){
      // Start just below a reinforcement maximum so varying N has a visible effect.
      // If no positive order exists, use a fractional phase within the scan instead.
      const cycles=Math.min(.96, (2*c.spacing/c.wavelength)*Math.sin(Math.PI/3)*.96);
      selected=360/Math.PI*Math.asin(cycles*c.wavelength/(2*c.spacing));
      initializeNearPeak=false;
    }
    if(follow&&peaks.length){
      selected=(peaks.find(p=>p.order===Number(selector.value))??peaks[0]).twoTheta;
    }
    // Do not write to a slider if it already holds the current value: this preserves dragging.
    for(const id of ["scanTwoTheta","scanVectorAngle"]){
      if(Number(el(id).value)!==selected)el(id).value=String(selected);
    }
    const r=finitePlaneInterference({...c,twoTheta:selected});
    el("scanAngleValue").textContent=el("scanVectorAngleValue").textContent=f(selected,3)+"°";
    el("scanPlanesValue").textContent=String(c.planes);
    el("scanResponse").textContent=f(r.normalizedIntensity*100,2)+"%";
    el("scanContext").textContent="d = "+f(c.spacing,3)+" Å · λ = "+f(c.wavelength,4)+" Å · adjacent path difference = "+f(r.cycles,4)+"λ";
    const phaseDegrees=360*(r.cycles-Math.round(r.cycles));
    el("scanPhaseValue").textContent=f(phaseDegrees,1)+"°";
    el("scanObservation").textContent=Math.abs(phaseDegrees)<1e-8?"All contributions align. Adding planes increases the unnormalized amplitude, but this normalized response remains 100%. Move the angle slightly to see the difference.":r.normalizedIntensity>0.99?"The contributions nearly align and reinforce.":r.normalizedIntensity<0.01?"The contributions nearly cancel.":"The contributions partially reinforce or cancel.";
    el("scanPlaneDots").innerHTML=Array.from({length:c.planes},()=>'<span class="scan-plane-dot"></span>').join("");
    el("scanPeakNote").textContent=peaks.length?peaks.length+" positive-order Bragg positions in the displayed range.":"No positive-order Bragg position in this range; 0° is forward scattering.";
    el("scanError").textContent="";el("scanPanels").hidden=false;
    plot(curve,r,peaks);vectors(r);
  }catch(e){
    key="";el("scanError").textContent=e.message;el("scanPanels").hidden=true;
    el("scanPeakSelect").disabled=el("scanSnap").disabled=true;
  }
}
for(const id of ["scanTwoTheta","scanVectorAngle"]){
  const changeAngle=()=>{selected=Number(el(id).value);follow=false;render();};
  el(id).addEventListener("input",changeAngle);
  el(id).addEventListener("change",changeAngle);
}
// Changing plane count never silently changes the selected scattering angle.
const changePlanes=()=>{follow=false;render();};
el("scanPlanes").addEventListener("input",changePlanes);
el("scanPlanes").addEventListener("change",changePlanes);
el("scanPeakSelect").addEventListener("change",()=>{follow=false;});
el("scanSnap").addEventListener("click",()=>{if(peaks.length){follow=true;render();}});
for(const id of ["latticeA","latticeSlider","planeFamily","wavelength","preset","mode","value","order","spacing-slider"]){
  el(id).addEventListener("input",render);el(id).addEventListener("change",render);
}
el("advancedPanel").addEventListener("toggle",render);
for(const id of ["reset","tryMeasuredPeak"]) el(id).addEventListener("click",()=>{follow=false;initializeNearPeak=true;el("scanPlanes").value="8";el("scanPeakSelect").value="1";render();});
render();
