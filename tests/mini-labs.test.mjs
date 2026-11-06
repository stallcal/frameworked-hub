import test from 'node:test';
import assert from 'node:assert/strict';
import {boxEnergy,wave,probability,populations,absorption} from '../assets/labs/model.mjs';
const near=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('electron confinement has the expected energy and scaling',()=>{
  near(boxEnergy(1,1),.37603016,1e-7);
  near(boxEnergy(2,1)/boxEnergy(1,1),4);
  near(boxEnergy(1,2)/boxEnergy(1,1),.25);
});
test('box states satisfy boundaries, normalization, and integrated density',()=>{
  for(let n=1;n<=5;n++){
    near(wave(n,0),0);near(wave(n,1),0);near(probability(n,0,1),1);
    near(probability(n,0,1/3),probability(n,2/3,1));
    // Independent numerical integration of |psi|² over the middle third.
    const count=12000,dx=1/3/count;
    let numerical=0;for(let i=0;i<count;i++)numerical+=wave(n,1/3+(i+.5)*dx)**2*dx;
    near(probability(n,1/3,2/3),numerical,1e-8);
  }
  near(probability(1,1/3,2/3),.608997781,1e-8);
});
test('thermal populations normalize and obey low/high temperature limits',()=>{
  for(const gap of [2,5,10])for(const t of [100,300,600,1000]){
    const p=populations(gap,t);near(p.lower+p.upper,1);
    assert.ok(p.upper>=0&&p.upper<.5);
    assert.ok(populations(gap,t+100).upper>p.upper);
  }
  near(populations(5,300).upper,.1187,.0001);
  near(populations(5,1).upper,0);near(populations(5,1e12).upper,.5,1e-9);
  assert.ok(populations(10,300).upper<populations(2,300).upper);
});
test('Beer-Lambert units, blank, log relation, and path/concentration scaling',()=>{
  near(absorption(0,2).transmission,1);
  const a=absorption(50,1),b=absorption(100,1),c=absorption(50,2);
  near(a.absorbance,.5);near(a.transmission,Math.sqrt(.1));
  near(b.absorbance,1);near(b.transmission,.1);near(b.transmission,a.transmission**2);
  near(c.absorbance,b.absorbance);near(c.transmission,b.transmission);
  near(-Math.log10(absorption(100,2).transmission),2);
});
