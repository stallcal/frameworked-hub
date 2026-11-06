import {test} from 'node:test';
import assert from 'node:assert/strict';
import {superposition,mixing,franckCondon,isotherm} from '../assets/intro/models.mjs';
test('superpositions conserve total probability for weights and phases',()=>{
 for(const w of [0,.2,.5,1])for(const phase of [0,Math.PI/2,Math.PI]){
 let area=0;for(let i=0;i<10000;i++)area+=superposition((i+.5)/10000,w,phase).density/10000;
 assert.ok(Math.abs(area-1)<1e-10);
 }
 assert.ok(Math.abs(superposition(.25,.5,0).density-superposition(.75,.5,Math.PI).density)<1e-12);
});
test('mixed levels preserve trace and determinant and handle degeneracy',()=>{
 for(const d of [-4,0,4])for(const v of [0,.5,2]){const m=mixing(d,v);assert.ok(Math.abs(m.lower+m.upper-d)<1e-12);assert.ok(Math.abs(m.lower*m.upper+v*v)<1e-12);}
 assert.equal(mixing(0,0).a,null);assert.equal(mixing(0,1).a,.5);assert.equal(mixing(4,0).a,1);assert.equal(mixing(-4,0).a,0);
});
test('Franck–Condon distribution has correct total and mean',()=>{
 assert.equal(franckCondon(0)[0],1);
 for(const s of [0,1,6]){const p=franckCondon(s,100);assert.ok(Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-12);assert.ok(Math.abs(p.reduce((a,b,n)=>a+n*b,0)-s)<1e-12);}
 assert.ok(franckCondon(6).reduce((a,b)=>a+b,0)>.9999);
});
test('schematic curves are finite, monotonic and loop branches meet',()=>{
 for(const t of ['I','II','III','IV','V','VI'])for(const branch of [false,true]){let prev=-1;for(let i=0;i<=100;i++){const y=isotherm(t,i/100,branch);assert.ok(Number.isFinite(y)&&y>=prev);prev=y;}}
 for(const t of ['IV','V']){assert.equal(isotherm(t,0),isotherm(t,0,true));assert.equal(isotherm(t,1),isotherm(t,1,true));assert.ok(isotherm(t,.5,true)>isotherm(t,.5));}
});
