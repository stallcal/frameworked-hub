import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  resultantAmplitude, wavesAt, sampleWaves, phaseToPathDifference,
  validateWaves
} from "../static/tools/wave-interference/model.mjs";

const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,"Expected "+a+" ≈ "+b);

test("equal coherent wave amplitudes add at 0° and 360°, cancel at 180°, and partially interfere at 90°",()=>{
  near(resultantAmplitude({phase:0}),2);
  near(resultantAmplitude({phase:360}),2);
  near(resultantAmplitude({phase:180}),0);
  near(resultantAmplitude({phase:90}),Math.sqrt(2));
  near(resultantAmplitude({phase:270}),Math.sqrt(2));
});
test("opposite-phase waves with unequal amplitudes cannot fully cancel",()=>{
  near(resultantAmplitude({phase:180,a1:1,a2:.5}),.5);
  near(resultantAmplitude({phase:0,a1:1,a2:.5}),1.5);
  near(resultantAmplitude({phase:180,a1:2,a2:1}),1);
  near(resultantAmplitude({phase:0,a1:1,a2:0}),1);
});
test("generated waves add point-by-point and have the predicted resultant amplitude",()=>{
  for(const phase of [0,30,90,120,180,270,360])
    for(const a2 of [0,.2,.75,1,1.5]){
      const state={phase,a1:1,a2};
      const samples=sampleWaves(state,481);
      near(samples[0].x,0);near(samples.at(-1).x,2);
      for(const p of samples){
        near(p.waveA+p.waveB,p.sum);
        assert.ok(Number.isFinite(p.sum));
        assert.ok(Math.abs(p.sum)<=resultantAmplitude(state)+1e-10);
      }
      near(wavesAt(.25,state).sum,
           Math.sin(Math.PI/2)+a2*Math.sin(Math.PI/2+phase*Math.PI/180));
    }
});
test("phase difference matches modulo-wavelength path offset",()=>{
  near(phaseToPathDifference(0),0);
  near(phaseToPathDifference(180),.5);
  near(phaseToPathDifference(360),1);
  assert.throws(()=>validateWaves({phase:361}));
  assert.throws(()=>resultantAmplitude({phase:-1}));
  assert.throws(()=>sampleWaves({phase:90},1));
  assert.throws(()=>wavesAt(Number.NaN,{phase:0}));
});
test("standalone tool is registered without replacing quantum superposition",()=>{
  const html=readFileSync(new URL("../static/tools/wave-interference/index.html",import.meta.url),"utf8");
  const directory=readFileSync(new URL("../layouts/tools/list.html",import.meta.url),"utf8");
  const required=["phase","amplitudeB","wavePlot","observationTitle","resultantValue","reset","secondaryControls"];
  for(const id of required) assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(directory,/url" "\/tools\/wave-interference\/"/);
  assert.match(html,/\/tools\/wave-superposition\//);
  assert.match(html,/\/tools\/bragg\//);
  assert.match(html,/src="\.\/app\.mjs"/);
  assert.match(html,/same wavelength and frequency/);
  assert.match(html,/How does the phase difference between two waves affect interference\?/);
  assert.match(html,/Change the phase difference to see when two waves reinforce or cancel/);
  assert.doesNotMatch(html,/Why does phase control interference\?/);
  assert.match(html,/Waves and resultant/);
  assert.match(html,/A full wavelength restores the same phase/);
  assert.doesNotMatch(html,/The blue and red waves have the same wavelength and frequency\. The green curve shows/);
});
test("phase, amplitude and reset update live SVG and the scientific explanation",async()=>{
  const initial={phase:"0",amplitudeB:"1"};
  const nodes=new Map();
  const buttons=["0","90","180"].map(v=>({
    dataset:{phase:v},handlers:{},attrs:{},
    addEventListener(type,fn){(this.handlers[type]||=[]).push(fn);},
    setAttribute(k,val){this.attrs[k]=val;}
  }));
  const get=id=>{
    if(!nodes.has(id)){
      let value=initial[id]??"";
      nodes.set(id,{
        id,get value(){return value;},set value(v){value=String(v);},
        textContent:"",innerHTML:"",open:false,handlers:{},
        addEventListener(type,fn){(this.handlers[type]||=[]).push(fn);}
      });
    }
    return nodes.get(id);
  };
  globalThis.document={getElementById:get,querySelectorAll:()=>buttons};
  try{
    await import("../static/tools/wave-interference/app.mjs");
    assert.equal(get("resultantValue").textContent,"2.00");
    assert.match(get("observationTitle").textContent,/Constructive/);
    assert.match(get("observationText").textContent,/Peaks and troughs align/);
    assert.doesNotMatch(get("observationText").textContent,/modulo one wavelength/);
    assert.match(get("wavePlot").innerHTML,/stroke="#089e4b"/);
    get("phase").value="90";
    for(const fn of get("phase").handlers.input)fn();
    assert.equal(get("resultantValue").textContent,"1.41");
    buttons[2].handlers.click[0]();
    assert.equal(get("resultantValue").textContent,"0.00");
    assert.match(get("observationTitle").textContent,/Complete destructive/);
    assert.equal(buttons[2].attrs["aria-pressed"],"true");
    get("amplitudeB").value="0.5";
    get("amplitudeB").handlers.input[0]();
    assert.equal(get("resultantValue").textContent,"0.50");
    assert.match(get("observationTitle").textContent,/Destructive/);
    get("secondaryControls").open=true;
    get("reset").handlers.click[0]();
    assert.equal(get("phase").value,"0");
    assert.equal(get("amplitudeB").value,"1");
    assert.equal(get("secondaryControls").open,false);
    assert.equal(get("resultantValue").textContent,"2.00");
  }finally{delete globalThis.document;}
});
