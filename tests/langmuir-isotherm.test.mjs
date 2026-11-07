import test from 'node:test';
import assert from 'node:assert/strict';
import {langmuirUptake,equilibriumWorkingCapacity,optimalAffinity} from '../assets/gas-explorer/langmuir-model.mjs';
const near=(actual,expected,eps=1e-11)=>assert.ok(Math.abs(actual-expected)<eps,actual+' != '+expected);
test('half saturation occurs at P = 1/K',()=>{
 for(const K of [.1,1,5,25,1000])near(langmuirUptake(1/K,4,K),2);
});
test('uptake is monotonic in P, between zero and qmax',()=>{
 for(const K of [.1,1,25,1000]){
  let previous=-1;
  for(let n=0;n<=100;n++){
   const q=langmuirUptake(n/100,4,K);
   assert.ok(q>=previous&&q>=0&&q<=4);
   previous=q;
  }
 }
 near(langmuirUptake(0,4,2),0);
});
test('working capacity subtracts retained equilibrium uptake',()=>{
 const ads=.15,regen=.01,K=25,qmax=4;
 near(equilibriumWorkingCapacity(ads,regen,qmax,K),langmuirUptake(ads,qmax,K)-langmuirUptake(regen,qmax,K));
 assert.ok(equilibriumWorkingCapacity(ads,regen,qmax,K)>0);
});
test('optimal affinity maximizes working capacity at positive pressures',()=>{
 const ads=.15,regen=.01,qmax=4,k=optimalAffinity(ads,regen);
 near(k,1/Math.sqrt(ads*regen));
 const atOpt=equilibriumWorkingCapacity(ads,regen,qmax,k);
 assert.ok(atOpt>equilibriumWorkingCapacity(ads,regen,qmax,k/10));
 assert.ok(atOpt>equilibriumWorkingCapacity(ads,regen,qmax,k*10));
 near(optimalAffinity(.15,0),Infinity);
});
test('reject invalid pressures, saturation and affinity',()=>{
 assert.throws(()=>langmuirUptake(-1,4,2),RangeError);
 assert.throws(()=>langmuirUptake(.1,0,2),RangeError);
 assert.throws(()=>langmuirUptake(.1,4,0),RangeError);
 assert.throws(()=>equilibriumWorkingCapacity(.1,.2,4,5),RangeError);
 assert.throws(()=>optimalAffinity(.1,-.01),RangeError);
});
