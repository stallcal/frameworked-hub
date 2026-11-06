import {boxEnergy, wave, probability, populations, absorption, R} from './model.mjs';

const root = document.querySelector('[data-lab]');
const $ = id => root.querySelector('#' + id);
const value = id => Number($(id).value);
const text = (id, content) => { $(id).textContent = content; };
const svg = $('lab-chart');
const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
svg.append(layer);
const label = (x,y,s,extra='') => `<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const line = (x1,y1,x2,y2,cls='grid') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const path = (f,x0,x1,y,scale,cls) => {
  const points = Array.from({length:241},(_,i)=>`${i?'L':'M'}${(x0+(x1-x0)*i/240).toFixed(2)},${(y-scale*f(i/240)).toFixed(2)}`).join(' ');
  return `<path d="${points}" class="${cls}"/>`;
};
const dot = (x,y) => `<circle cx="${x}" cy="${y}" r="6" class="point"/>`;
const percent = number => (100*number).toFixed(1)+'%';
function graphAxes(top,bottom,max,xMax,xLabel,yLabel) {
  let s = label(62,top-15,yLabel,'class="plot-label"');
  for (const f of [0,.5,1]) {
    const y=bottom-(bottom-top)*f;
    s+=line(62,y,560,y)+label(50,y+6,+(f*max).toFixed(2),'text-anchor="end"');
    const x=62+498*f;
    s+=label(x,bottom+25,xMax*f,'text-anchor="middle"');
  }
  return s+label(311,bottom+52,xLabel,'text-anchor="middle"');
}
function box() {
  const n=value('state'), L=value('length');
  const intervals={middle:[1/3,2/3],left:[0,1/3],right:[2/3,1],whole:[0,1]};
  const [a,b]=intervals[$('interval').value];
  const p=probability(n,a,b), E=boxEnergy(n,L);
  text('length-value',L.toFixed(2)+' nm');text('state-value','n = '+n);
  text('energy',E.toFixed(3)+' eV');text('nodes',n-1);text('chance',percent(p));
  const interval=$('interval').selectedOptions[0].textContent.toLowerCase();
  text('takeaway',`For n = ${n}, the electron has ${n-1} interior ${n===2?'node':'nodes'} and a ${percent(p)} chance of being found in the ${interval}. At ${L.toFixed(2)} nm its energy is ${E.toFixed(3)} eV. Doubling the width at fixed n reduces energy to one quarter. The shape stays the same on this x/L axis; the physical box is wider.`);
  text('chart-desc',`Quantum number ${n}, width ${L.toFixed(2)} nanometers. The wavefunction has ${n-1} interior nodes. The probability in the ${interval} is ${percent(p)}.`);
  let s=label(62,24,'Wavefunction · ψ√L','class="plot-label"');
  for(const v of [-1.4,0,1.4]) s+=line(62,115-v*44,560,115-v*44)+label(50,121-v*44,v,'text-anchor="end"');
  s+=path(t=>wave(n,t),62,560,115,44,'blue');
  s+=label(62,220,'Probability density · L|ψ|²','class="plot-label"');
  s+=`<rect x="${62+498*a}" y="240" width="${498*(b-a)}" height="105" fill="#087e48" opacity=".12"/>`;
  for(const v of [0,1,2]) s+=line(62,345-v*50,560,345-v*50)+label(50,351-v*50,v,'text-anchor="end"');
  s+=path(t=>wave(n,t)**2,62,560,345,50,'red');
  for(const f of [0,.5,1]) s+=label(62+498*f,371,f,'text-anchor="middle"');
  s+=label(311,397,'Position, x/L','text-anchor="middle"');
  for(const x of [62,560])s+=line(x,40,x,181)+line(x,240,x,345);
  layer.innerHTML=s;
}
function thermal() {
  const T=value('temperature'), gap=value('gap');
  const {lower,upper}=populations(gap,T), ratio=gap*1000/(R*T);
  text('temperature-value',T+' K');text('lower',percent(lower));text('upper',percent(upper));text('thermal-ratio',ratio.toFixed(2));
  text('takeaway',`At ${T} K, ${percent(upper)} of the population occupies the upper state. The ${gap} kJ/mol gap is ${ratio.toFixed(2)} times RT. Heating increases the upper population, but the two equal-degeneracy states only approach 50:50 at very high temperature. With this gap, going from 300 K to 600 K changes the upper population from ${percent(populations(gap,300).upper)} to ${percent(populations(gap,600).upper)}.`);
  text('chart-desc',`At ${T} kelvin and an energy gap of ${gap} kilojoules per mole, the lower state contains ${percent(lower)} and the upper state ${percent(upper)}. The upper fraction increases with temperature toward 50 percent.`);
  let s=label(62,25,'Current population','class="plot-label"');
  s+=label(62,60,'Lower · 0')+label(62,116,`Upper · ΔE`);
  s+=`<rect x="200" y="39" width="${280*lower}" height="25" fill="#084b9e"/><rect x="200" y="95" width="${280*upper}" height="25" fill="#9e382e"/>`;
  s+=label(560,60,percent(lower),'text-anchor="end"')+label(560,116,percent(upper),'text-anchor="end"');
  s+=label(200,150,'Bar length = fraction of the whole');
  s+=graphAxes(210,340,50,1000,'Temperature / K','Upper-state population / %');
  s+=path(t=>populations(gap,1000*t).upper,62,560,340,260,'red');
  const x=62+498*T/1000,y=340-260*upper;
  s+=line(x,210,x,340)+dot(x,y);layer.innerHTML=s;
}
function light() {
  const c=value('concentration'), l=value('path');
  const {absorbance:A,transmission:T}=absorption(c,l);
  text('concentration-value',c+' µM');text('path-value',l.toFixed(1)+' cm');
  text('absorbance',A.toFixed(2));text('transmission',percent(T));text('absorbed',percent(1-T));
  text('takeaway',c===0?'With no absorber in the cell, A = 0 and all the light is transmitted in this ideal model. Add solute to see the calibration point rise.':`At ${c} µM and ${l.toFixed(1)} cm, A = ${A.toFixed(2)} and ${percent(T)} of the light gets through. Doubling concentration at fixed path doubles absorbance, while the transmission fraction is squared. For example, at 1 cm, 50 µM transmits 31.6% and 100 µM transmits 10.0%.`);
  text('chart-desc',`At ${c} micromolar and a path length of ${l.toFixed(1)} centimeters, absorbance is ${A.toFixed(2)} and transmission is ${percent(T)}. Absorbance is linear in concentration.`);
  const width=70+70*l,left=300-width/2,right=300+width/2;
  let s=label(62,25,'Incident light','class="plot-label"')+label(560,25,'Transmitted','text-anchor="end" class="plot-label"');
  s+=`<rect x="62" y="65" width="${left-62}" height="24" fill="#084b9e"/><rect x="${right}" y="65" width="${560-right}" height="24" fill="#084b9e" opacity="${T}"/><rect x="${left}" y="43" width="${width}" height="68" fill="#9e382e" fill-opacity="${.05+.2*c/100}" stroke="#9e382e" stroke-width="2"/>`;
  s+=label(62,135,'100%')+label(300,135,l.toFixed(1)+' cm cell','text-anchor="middle"')+label(560,135,percent(T),'text-anchor="end"');
  s+=graphAxes(210,340,2,100,'Concentration / µM','Absorbance, A');
  s+=path(t=>absorption(t*100,l).absorbance,62,560,340,65,'blue');
  s+=dot(62+498*c/100,340-65*A);layer.innerHTML=s;
}
const update={box,thermal,light}[root.dataset.lab];
const form=root.querySelector('form');
form.addEventListener('submit',event=>event.preventDefault());
form.addEventListener('input',update);
form.addEventListener('change',update);
form.addEventListener('reset',()=>requestAnimationFrame(update));
root.querySelector('[data-preset]').addEventListener('click',()=>{
  if(root.dataset.lab==='box'){ $('length').value=2;$('state').value=1; }
  if(root.dataset.lab==='thermal')$('temperature').value=600;
  if(root.dataset.lab==='light'){ $('concentration').value=100;$('path').value=1; }
  update();
});
update();
