import {langmuirUptake,equilibriumWorkingCapacity,optimalAffinity} from './langmuir-model.mjs';
const $=id=>document.getElementById(id),svg=$('langmuir-plot'),ns='http://www.w3.org/2000/svg';
function mark(name,attributes={},value){
 const element=document.createElementNS(ns,name);
 for(const [key,attribute] of Object.entries(attributes))element.setAttribute(key,attribute);
 if(value!==undefined)element.textContent=value;
 svg.append(element);return element;
}
const fmt=(x,n=2)=>x.toFixed(n);
function draw(qmax,K,ads,des){
 svg.replaceChildren();
 const high=langmuirUptake(ads,qmax,K),low=langmuirUptake(des,qmax,K);
 mark('title',{id:'langmuir-plot-title'},'Langmuir CO₂ uptake as a function of partial pressure');
 mark('desc',{id:'langmuir-plot-desc'},'Current affinity '+fmt(K,2)+' inverse bar. Uptake at '+fmt(ads,3)+' bar is '+fmt(high,3)+' millimoles per gram; retained uptake at '+fmt(des,3)+' bar is '+fmt(low,3)+'.');
 const X=p=>70+495*p/.5,Y=q=>271-220*q/(qmax*1.08);
 mark('rect',{x:X(des),y:37,width:X(ads)-X(des),height:234,fill:'#e7eef7'});
 for(const f of [0,.25,.5,.75,1]){
  const y=Y(qmax*f);
  mark('line',{x1:70,x2:565,y1:y,y2:y,stroke:'#c9d6e1','stroke-width':1});
  mark('text',{x:62,y:y+5,'text-anchor':'end','font-size':13},fmt(qmax*f,1));
 }
 for(const p of [0,.1,.2,.3,.4,.5]){
  mark('text',{x:X(p),y:295,'text-anchor':'middle','font-size':13},fmt(p,1));
 }
 mark('line',{x1:70,y1:37,x2:70,y2:271,stroke:'#52677b','stroke-width':2});
 mark('line',{x1:70,y1:271,x2:565,y2:271,stroke:'#52677b','stroke-width':2});
 mark('text',{x:65,y:22,'font-size':14,'font-weight':650},'CO₂ uptake (mmol/g)');
 mark('text',{x:317,y:322,'text-anchor':'middle','font-size':14},'CO₂ partial pressure (bar)');
 const plot=(affinity,color,dash)=>{
  let d='';
  for(let i=0;i<=200;i++){
   const pressure=.5*i/200;
   d+=(i?'L':'M')+X(pressure).toFixed(2)+' '+Y(langmuirUptake(pressure,qmax,affinity)).toFixed(2)+' ';
  }
  mark('path',{d,fill:'none',stroke:color,'stroke-width':3,...(dash?{'stroke-dasharray':'7 5'}:{})});
 };
 plot(5,'#9e382e',true);
 plot(K,'#084b9e',false);
 for(const [p,label] of [[des,'Regeneration'],[ads,'Adsorption']]){
  mark('line',{x1:X(p),x2:X(p),y1:37,y2:271,stroke:'#52677b','stroke-width':1.6,'stroke-dasharray':'4 4'});
  mark('circle',{cx:X(p),cy:Y(langmuirUptake(p,qmax,K)),r:6,fill:'white',stroke:'#084b9e','stroke-width':3});
 }
 return {high,low};
}
function render(){
 const K=10**Number($('langmuir-affinity').value),qmax=Number($('langmuir-qmax').value),ads=Number($('langmuir-ads').value);
 const desInput=$('langmuir-des');
 const des=Math.min(Number(desInput.value),Number((ads-.001).toFixed(3)));
 if(Number(desInput.value)!==des)desInput.value=String(des);
 $('langmuir-affinity-value').textContent=fmt(K,K<1?3:1)+' bar⁻¹';
 $('langmuir-qmax-value').textContent=fmt(qmax,1)+' mmol/g';
 $('langmuir-ads-value').textContent=fmt(ads,3)+' bar';
 $('langmuir-des-value').textContent=fmt(des,3)+' bar';
 const {high,low}=draw(qmax,K,ads,des);
 const working=equilibriumWorkingCapacity(ads,des,qmax,K);
 const optimum=optimalAffinity(ads,des);
 const reference=equilibriumWorkingCapacity(ads,des,qmax,5);
 $('langmuir-high').textContent=fmt(high,3)+' mmol/g';
 $('langmuir-low').textContent=fmt(low,3)+' mmol/g';
 $('langmuir-work').textContent=fmt(working,3)+' mmol/g';
 const comparison=working>=reference?'more':'less';
 const direction=K>optimum*1.03?'Above this optimum, further increasing affinity retains too much CO₂ during regeneration.':K<optimum*.97?'Below this optimum, increasing affinity can improve uptake more than it increases retention.':'You are close to the optimum affinity for this idealized pressure swing.';
 $('langmuir-explanation').textContent='At the selected pressures, the model predicts '+fmt(working,3)+' mmol/g of equilibrium working capacity, '+comparison+' than the 5 bar⁻¹ reference ('+fmt(reference,3)+' mmol/g). For fixed saturation capacity and both pressures above zero, the model has an optimum K = 1/√(P_ads P_regen) = '+fmt(optimum,1)+' bar⁻¹. '+direction+' This does not establish actual CO₂ capture performance.';
}
$('langmuir-form').addEventListener('input',render);
$('langmuir-form').addEventListener('submit',event=>event.preventDefault());
$('langmuir-form').addEventListener('reset',()=>requestAnimationFrame(render));
render();
