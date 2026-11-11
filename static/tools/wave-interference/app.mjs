import { sampleWaves, resultantAmplitude, phaseToPathDifference } from "./model.mjs";

const byId = id => document.getElementById(id);
const phase = byId("phase");
const amplitudeB = byId("amplitudeB");
const plot = byId("wavePlot");
const presetButtons = Array.from(document.querySelectorAll("[data-phase]"));
const fmt = n => n.toFixed(2);

function makePath(samples, key, xScale, yScale) {
  return samples.map((point,i)=>
    (i===0?"M":"L")+xScale(point.x).toFixed(2)+" "+yScale(point[key]).toFixed(2)
  ).join(" ");
}

function drawPlot(samples) {
  const width=850,height=340,left=70,right=23,top=23,bottom=57;
  const xScale=x=>left+(x/2)*(width-left-right);
  const yScale=y=>top+((2.7-y)/5.4)*(height-top-bottom);
  const svg = [
    '<rect width="850" height="340" fill="#fff"/>',
    '<rect x="'+left+'" y="'+top+'" width="'+(width-left-right)+
      '" height="'+(height-top-bottom)+'" fill="#f7faff" stroke="#ccdbea"/>'
  ];
  for (const y of [-2,-1,0,1,2]) {
    const yy=yScale(y).toFixed(2);
    svg.push('<path d="M'+left+' '+yy+'H'+(width-right)+
      '" stroke="'+(y===0?'#859cb8':'#dbe5f2')+
      '" stroke-width="'+(y===0?1.7:1)+'" stroke-dasharray="'+
      (y===0?'':'3 5')+'"/>');
    svg.push('<text x="'+(left-13)+'" y="'+(Number(yy)+5)+
      '" text-anchor="end" fill="#4d6680" font-size="13">'+y+'</text>');
  }
  for (const x of [0,.5,1,1.5,2]) {
    const xx=xScale(x).toFixed(2);
    svg.push('<path d="M'+xx+' '+top+'V'+(height-bottom)+
      '" stroke="#dbe5f2" stroke-width="1" stroke-dasharray="3 5"/>');
    svg.push('<text x="'+xx+'" y="'+(height-bottom+25)+
      '" text-anchor="middle" fill="#4d6680" font-size="13">'+x+'</text>');
  }
  svg.push(
    '<text x="424" y="328" text-anchor="middle" fill="#1c3049" font-size="14">Position / wavelength (x/λ)</text>',
    '<text transform="translate(20,151) rotate(-90)" text-anchor="middle" fill="#1c3049" font-size="13">Amplitude (relative units)</text>',
    '<path d="'+makePath(samples,"waveA",xScale,yScale)+'" stroke="#084b9e" stroke-width="2.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
    '<path d="'+makePath(samples,"waveB",xScale,yScale)+'" stroke="#9e382e" stroke-width="2.8" fill="none" stroke-dasharray="7 4" stroke-linejoin="round" stroke-linecap="round"/>',
    '<path d="'+makePath(samples,"sum",xScale,yScale)+'" stroke="#089e4b" stroke-width="3.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'
  );
  plot.innerHTML=svg.join("");
}

function explanation(phi,a2,result) {
  const equal=Math.abs(a2-1)<1e-8;
  const inPhase=phi===0||phi===360;
  const opposite=phi===180;
  if(a2===0) return ["Only wave A is present",
    "Wave B has zero amplitude, so adding it does not change wave A."];
  if(inPhase) return ["Constructive interference",
    "The waves are in phase, so their peaks and troughs line up and their amplitudes add."];
  if(opposite&&equal) return ["Complete destructive interference",
    "The waves have equal amplitudes and are 180° out of phase. Their peaks and troughs cancel completely."];
  if(opposite) return ["Destructive interference",
    "The waves are 180° out of phase, but their amplitudes differ. A smaller wave remains in the sum."];
  if(phi===90||phi===270) return ["Partial interference",
    "A quarter-cycle offset gives a combined amplitude between the in-phase and out-of-phase limits."];
  return ["Partial interference",
    "Changing the phase difference changes the amplitude of the combined wave."];
}

function render() {
  const phi=Number(phase.value), a2=Number(amplitudeB.value),state={phase:phi,a1:1,a2};
  const samples=sampleWaves(state);
  const r=resultantAmplitude(state);
  drawPlot(samples);
  byId("phaseValue").textContent=phi+"°";
  byId("amplitudeBValue").textContent=fmt(a2);
  byId("resultantValue").textContent=fmt(r);
  const [title,body]=explanation(phi,a2,r);
  byId("observationTitle").textContent=title;
  byId("observationText").textContent=body+
    " Equivalent extra path: "+fmt(phaseToPathDifference(phi))+
    " wavelengths (modulo one wavelength).";
  for(const button of presetButtons){
    button.setAttribute("aria-pressed",String(Number(button.dataset.phase)===phi));
  }
}

phase.addEventListener("input",render);
amplitudeB.addEventListener("input",render);
for (const button of presetButtons) {
  button.addEventListener("click",()=>{
    phase.value=button.dataset.phase;
    render();
  });
}
byId("reset").addEventListener("click",()=>{
  phase.value="0";
  amplitudeB.value="1";
  byId("secondaryControls").open=false;
  render();
});
render();
