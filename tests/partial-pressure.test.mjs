import test from 'node:test';
import assert from 'node:assert/strict';
import {partialPressure,percentToFraction,ppmToFraction,fractionToPpm} from '../assets/gas-explorer/pressure-model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,String(a)+' != '+String(b));
test('CO2 partial pressure from a 15 percent flue gas example',()=>{
 near(partialPressure(1,percentToFraction(15)),.15);
 near(partialPressure(2,percentToFraction(15)),.30);
});
test('420 ppm corresponds to 0.042 percent and 0.000420 bar at one bar total',()=>{
 near(ppmToFraction(420),.000420);
 near(percentToFraction(.042),.000420);
 near(partialPressure(1,ppmToFraction(420)),.000420);
 near(fractionToPpm(.000420),420);
});
test('pure, absent and complement gases add to total',()=>{
 for(const total of [.5,1,3.7,10])for(const y of [0,.00042,.15,1]){
  const p=partialPressure(total,y);
  near(p+(total-p),total);
  assert.ok(p>=0&&p<=total);
 }
});
test('invalid absolute pressures and mole fractions are rejected',()=>{
 assert.throws(()=>partialPressure(0,.15),RangeError);
 assert.throws(()=>partialPressure(1,-.1),RangeError);
 assert.throws(()=>partialPressure(1,1.1),RangeError);
 assert.throws(()=>percentToFraction(101),RangeError);
 assert.throws(()=>ppmToFraction(1e6+1),RangeError);
});
