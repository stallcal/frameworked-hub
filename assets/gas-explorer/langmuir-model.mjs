// Ideal, single-component, isothermal Langmuir adsorption model.
// qmax: mmol/g; K: 1/bar; P: bar partial pressure.
export function langmuirUptake(pressureBar,qmax,K){
 if(!Number.isFinite(pressureBar)||pressureBar<0)throw new RangeError('Pressure must be nonnegative');
 if(!Number.isFinite(qmax)||qmax<=0)throw new RangeError('Saturation capacity must be positive');
 if(!Number.isFinite(K)||K<=0)throw new RangeError('Affinity must be positive');
 return qmax*(K*pressureBar)/(1+K*pressureBar);
}
export function equilibriumWorkingCapacity(adsorptionBar,desorptionBar,qmax,K){
 if(!Number.isFinite(adsorptionBar)||!Number.isFinite(desorptionBar)||adsorptionBar<=desorptionBar||desorptionBar<0)throw new RangeError('Require adsorption pressure above nonnegative desorption pressure');
 return langmuirUptake(adsorptionBar,qmax,K)-langmuirUptake(desorptionBar,qmax,K);
}
// Affinity maximizing isothermal equilibrium swing capacity at fixed qmax, Pads > Pdes > 0.
export function optimalAffinity(adsorptionBar,desorptionBar){
 if(!Number.isFinite(adsorptionBar)||!Number.isFinite(desorptionBar)||adsorptionBar<=desorptionBar||desorptionBar<0)throw new RangeError('Invalid pressure swing');
 return desorptionBar===0?Infinity:1/Math.sqrt(adsorptionBar*desorptionBar);
}
