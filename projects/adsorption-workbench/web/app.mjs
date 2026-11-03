import {convertUptake,convertPressure,UNITS,PRESSURES} from './model.mjs';
const $=id=>document.getElementById(id),number=id=>$(id).value.trim()===''?NaN:Number($(id).value),fmt=x=>Number(x.toPrecision(7)).toString();
let record;
for(const id of ['from','to'])for(const [value,label] of Object.entries(UNITS))$(id).add(new Option(label,value));
for(const id of ['p-from','p-to'])for(const value of Object.keys(PRESSURES))$(id).add(new Option(value,value));
$('to').value='cm3/g';$('p-from').value='bar';$('p-to').value='kPa';
function update(){try{
  record=convertUptake({value:number('value'),from:$('from').value,to:$('to').value,molarMass:number('mass'),temperature:number('temperature'),pressure:number('pressure'),basis:$('basis').value});
  $('results').hidden=false;$('error').textContent='';$('output').textContent=fmt(record.value);$('out-unit').textContent=UNITS[record.to];
  $('basis-out').textContent=`Reporting basis: ${record.basis}. The conversion preserves this basis.`;
  $('steps').textContent=`${fmt(record.input)} ${UNITS[record.from]} → ${fmt(record.canonical)} mmol/g → ${fmt(record.value)} ${UNITS[record.to]}`;
  const mass=record.molarMass?`Molar mass: ${fmt(record.molarMass)} g/mol. `:'';
  $('conditions').textContent=mass+(record.temperature?`Ideal-gas reference: ${fmt(record.temperature)} K and ${fmt(record.pressure)} kPa absolute. Z = 1.`:'No gas-volume reference conditions enter this conversion.');
}catch(e){record=null;$('results').hidden=true;$('error').textContent=e.message;}}
function pressure(){try{$('pressure-result').textContent=`${fmt(number('p-value'))} ${$('p-from').value} = ${fmt(convertPressure(number('p-value'),$('p-from').value,$('p-to').value))} ${$('p-to').value}`;}catch(e){$('pressure-result').textContent=e.message;}}
for(const id of ['value','from','to','mass','temperature','pressure','basis'])$(id).addEventListener('input',()=>{if(id==='mass')$('gas').value='custom';if(['temperature','pressure'].includes(id))$('reference').value='custom';update();});
$('gas').addEventListener('change',()=>{if($('gas').value!=='custom')$('mass').value=$('gas').value;update();});
$('reference').addEventListener('change',()=>{if($('reference').value!=='custom'){$('temperature').value=273.15;$('pressure').value=$('reference').value==='bar'?100:101.325;}update();});
for(const id of ['p-value','p-from','p-to'])$(id).addEventListener('input',pressure);
$('reset').addEventListener('click',()=>{$('value').value=1;$('from').value='mmol/g';$('to').value='cm3/g';$('mass').value=44.0095;$('gas').value='44.0095';$('temperature').value=273.15;$('pressure').value=101.325;$('reference').value='atm';$('basis').value='unspecified';$('p-value').value=1;$('p-from').value='bar';$('p-to').value='kPa';update();pressure();});
$('export').addEventListener('click',()=>{if(!record)return;const url=URL.createObjectURL(new Blob([JSON.stringify({tool:'Frameworked adsorption converter',...record,units:{molarMass:'g/mol',referenceTemperature:'K',referencePressure:'kPa absolute',canonical:'mmol/g'},created:new Date().toISOString()},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='adsorption-conversion.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
update();pressure();
