import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {finitePlaneInterference,finitePlaneScan,predictedBraggOrders} from "../static/tools/bragg/scan-model.mjs";
const spacing=4,wavelength=1.5406;
const angle=c=>360/Math.PI*Math.asin(c*wavelength/(2*spacing));
const response=(c,planes=8)=>finitePlaneInterference({spacing,wavelength,planes,twoTheta:angle(c)}).normalizedIntensity;
test("positive orders reinforce and even stacks cancel at half cycles",()=>{
  for(const n of [2,8,20]) assert.ok(Math.abs(response(1,n)-1)<1e-12);
  assert.ok(response(.5)<1e-24);assert.ok(response(.125)<1e-24);
  assert.ok(response(.1)>0&&response(.1)<1);
});
test("odd plane count leaves a residual at half cycle",()=>assert.ok(Math.abs(response(.5,3)-1/9)<1e-12));
test("larger stack narrows the normalized maximum",()=>assert.ok(response(1.04,20)<response(1.04,2)));
test("scan includes exact maxima even with sharp peaks",()=>{
  for(const d of [4,12,30]){
    const c={spacing:d,wavelength,planes:20},p=predictedBraggOrders(c),s=finitePlaneScan(c);
    assert.equal(s[0].twoTheta,0);assert.equal(s.at(-1).twoTheta,120);
    assert.ok(s.every(v=>Number.isFinite(v.normalizedIntensity)&&v.normalizedIntensity>=0&&v.normalizedIntensity<=1));
    for(const peak of p)assert.ok(s.some(v=>v.twoTheta===peak.twoTheta&&v.normalizedIntensity>1-1e-12));
  }
});
test("zero angle is forward scattering and is not listed as a positive order",()=>{
  assert.equal(response(0),1);assert.ok(predictedBraggOrders({spacing,wavelength}).every(p=>p.order>0));
  assert.deepEqual(predictedBraggOrders({spacing,wavelength:20}),[]);
});
test("unresolvable ratios and invalid inputs are rejected rather than aliased",()=>{
  assert.throws(()=>finitePlaneScan({spacing:12,wavelength:.001,planes:20}));
  assert.throws(()=>finitePlaneInterference({spacing,wavelength,twoTheta:20,planes:21}));
  assert.throws(()=>predictedBraggOrders({spacing:0,wavelength}));
});
test("scan is a separate section; existing UI and scientific scope remain",()=>{
  const h=readFileSync(new URL("../static/tools/bragg/index.html",import.meta.url),"utf8");
  for(const id of ["geometry","latticeSlider","advancedPanel","interferenceLesson","scanTwoTheta","scanPlanes","scanIntensity","scanPhasors","scanSnap"]) assert.ok(h.includes('id="'+id+'"'),id);
  assert.match(h,/not an experimental PXRD pattern/);
  assert.match(h,/step="any" value="22.2"/);
});
test("scan follows calculator conditions but does not change calculator readouts",async()=>{
  const nodes=new Map(),defaults={wavelength:"1.5406",latticeA:"4",planeFamily:"10",scanPlanes:"8",scanTwoTheta:"22.2",scanPeakSelect:"1",mode:"spacing",value:"3",order:"1","angle-out":"22.21°"};
  const el=id=>{if(!nodes.has(id))nodes.set(id,{value:defaults[id]??"",innerHTML:"",textContent:"",open:false,hidden:false,disabled:false,handlers:{},addEventListener(e,f){(this.handlers[e]??=[]).push(f)}});return nodes.get(id)};
  const fire=(id,e)=>el(id).handlers[e].forEach(fn=>fn());
  globalThis.document={getElementById:el};
  try{
    el("angle-out").textContent="22.21°";
    await import("../static/tools/bragg/scan-view.mjs");
    assert.ok(Number.parseFloat(el("scanResponse").textContent)<100);
    assert.ok(Math.abs(Number(el("scanTwoTheta").value)-angle(.96))<1e-10);
    assert.equal(el("scanTwoTheta").value,el("scanVectorAngle").value);
    const initialVectors=el("scanPhasors").innerHTML;
    const initialResponse=el("scanResponse").textContent;
    el("scanPlanes").value="12";fire("scanPlanes","input");
    assert.notEqual(el("scanPhasors").innerHTML,initialVectors);
    assert.notEqual(el("scanResponse").textContent,initialResponse);
    assert.equal((el("scanPhasors").innerHTML.match(/class="scan-contribution"/g)||[]).length,12);
    assert.equal((el("scanPlaneDots").innerHTML.match(/scan-plane-dot/g)||[]).length,12);
    el("scanVectorAngle").value="32";fire("scanVectorAngle","change");
    assert.equal(el("scanTwoTheta").value,"32");
    assert.equal(el("scanAngleValue").textContent,"32.000°");
    el("scanTwoTheta").value="45";fire("scanTwoTheta","input");
    assert.equal(el("scanAngleValue").textContent,"45.000°");
    assert.equal(el("angle-out").textContent,"22.21°");
    el("scanPlanes").value="20";fire("scanPlanes","input");
    assert.equal(el("scanPlanesValue").textContent,"20");
    el("latticeA").value="5";fire("latticeA","input");
    assert.equal(el("scanAngleValue").textContent,"45.000°");
    el("scanPeakSelect").value="2";fire("scanPeakSelect","change");fire("scanSnap","click");
    assert.equal(el("scanResponse").textContent,"100.00%");
    const snapped=el("scanTwoTheta").value;
    el("scanPlanes").value="2";fire("scanPlanes","change");
    assert.equal(el("scanTwoTheta").value,snapped);
    assert.equal(el("scanResponse").textContent,"100.00%");
    assert.equal((el("scanPhasors").innerHTML.match(/class="scan-contribution"/g)||[]).length,2);
    assert.match(el("scanObservation").textContent,/normalized response remains 100%/);
    el("wavelength").value="20";fire("wavelength","input");
    assert.equal(el("scanPanels").hidden,false);assert.equal(el("scanSnap").disabled,true);
    el("wavelength").value=".001";fire("wavelength","input");
    assert.equal(el("scanPanels").hidden,true);
  }finally{delete globalThis.document}
});
