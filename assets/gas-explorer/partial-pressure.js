import {partialPressure,percentToFraction,fractionToPpm} from './pressure-model.mjs';
const $=id=>document.getElementById(id);
const svg=$('gas-plot'),ns='http://www.w3.org/2000/svg';
const presets={flue:{total:1,percent:15},air:{total:1,percent:.042},pure:{total:1,percent:100}};
const fmt=(value,digits=4)=>Number(value.toFixed(digits)).toLocaleString('en-US',{maximumFractionDigits:digits});
const bar=value=>(value<.01?value.toPrecision(3):fmt(value,4))+' bar';
function tag(tagName,attrs={},content){
 const node=document.createElementNS(ns,tagName);
 for(const [key,val] of Object.entries(attrs))node.setAttribute(key,val);
 if(content!==undefined)node.textContent=content;
 svg.append(node);return node;
}
function draw(total,co2,balance,percent){
 svg.replaceChildren();
 tag('title',{id:'gas-plot-title'},'CO₂ and balance-gas pressure contributions');
 tag('desc',{id:'gas-plot-desc'},'At '+fmt(total,2)+' bar total, CO₂ contributes '+bar(co2)+' and other gases '+bar(balance)+'.');
 const x=67,y=105,width=475,height=62,scale=width/total;
 tag('text',{x:67,y:36,'font-weight':650},'Ideal mixture at '+fmt(total,2)+' bar total');
 tag('text',{x:67,y:68},'Each segment contributes to the total pressure');
 tag('rect',{x,y,width,height,fill:'#8da7c1'});
 if(co2>0)tag('rect',{x,y,width:width*percent/100,height,fill:'#9e382e'});
 tag('rect',{x,y,width,height,fill:'none',stroke:'#52677b','stroke-width':1.5});
 for(const fraction of [0,.25,.5,.75,1]){
  const px=x+fraction*width;
  tag('line',{x1:px,y1:y+height,x2:px,y2:y+height+7,stroke:'#52677b'});
  tag('text',{x:px,y:196,'text-anchor':'middle','font-size':13},fmt(total*fraction,2));
 }
 tag('text',{x:304,y:229,'text-anchor':'middle'},'Absolute partial pressure (bar)');
 tag('text',{x:67,y:256,'font-size':13},'CO₂: '+bar(co2)+'  ·  Balance: '+bar(balance));
}
function render(){
 const total=Number($('gas-total').value),raw=Number($('gas-percent').value);
 const valid=$('gas-percent').value!==''&&Number.isFinite(raw)&&raw>=0&&raw<=100;
 $('gas-percent').setCustomValidity(valid?'':'Enter a CO₂ percentage between 0 and 100.');
 if(!valid){$('gas-explanation').textContent='Enter a CO₂ percentage from 0 to 100 to calculate the partial pressure.';return;}
 const fraction=percentToFraction(raw),co2=partialPressure(total,fraction),balance=total-co2;
 $('gas-total-value').textContent=fmt(total,2)+' bar';
 $('gas-y').textContent=fmt(fraction,6);
 $('gas-ppm').textContent=fmt(fractionToPpm(fraction),1)+' ppm';
 $('gas-pco2').textContent=bar(co2);
 $('gas-explanation').textContent='At '+fmt(total,2)+' bar total pressure, '+fmt(raw,5)+'% CO₂ contributes '+bar(co2)+'. The remaining gases contribute '+bar(balance)+'. Changing total pressure changes the CO₂ partial pressure even when composition stays constant.';
 draw(total,co2,balance,raw);
}
$('gas-preset').addEventListener('change',()=>{
 const chosen=presets[$('gas-preset').value];
 if(chosen){$('gas-total').value=chosen.total;$('gas-percent').value=chosen.percent;}
 render();
});
$('gas-total').addEventListener('input',render);
$('gas-percent').addEventListener('input',()=>{$('gas-preset').value='custom';render();});
$('gas-form').addEventListener('submit',event=>event.preventDefault());
$('gas-form').addEventListener('reset',()=>requestAnimationFrame(()=>{$('gas-preset').value='flue';render();}));
render();
