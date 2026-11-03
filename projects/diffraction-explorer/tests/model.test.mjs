import test from 'node:test';
import assert from 'node:assert/strict';
import {bragg} from '../web/model.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('known first-order geometry and scattering vector',()=>{const r=bragg({value:1,wavelength:1});near(r.theta,30);near(r.twoTheta,60);near(r.q,2*Math.PI);near(r.pathDifference,1);});
test('spacing, 2theta, and q round trips for several orders and wavelengths',()=>{for(const order of [1,2,3])for(const wavelength of [.5,1,1.5406]){const a=bragg({value:4,wavelength,order});near(bragg({mode:'angle',value:a.twoTheta,wavelength,order}).spacing,4);near(bragg({mode:'q',value:a.q,wavelength,order}).spacing,4);near(a.q,2*Math.PI*order/4);}});
test('backscattering limit is 180 degrees in 2theta',()=>{near(bragg({value:.5,wavelength:1}).twoTheta,180);});
test('larger spacing lowers the first-order angle',()=>assert.ok(bragg({value:5}).twoTheta<bragg({value:2}).twoTheta));
test('rejects impossible, zero, nonfinite, and fractional-order inputs',()=>{for(const args of [{value:0},{value:NaN},{wavelength:Infinity},{order:1.5},{order:0},{value:.1,wavelength:1},{mode:'angle',value:181},{mode:'q',value:20,wavelength:1},{mode:'bad'}])assert.throws(()=>bragg(args));});
