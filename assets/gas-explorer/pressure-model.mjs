// Dalton's law in an ideal gas mixture: p_i = y_i P_total.
// Absolute pressure in bar, dimensionless mole fraction y_i.
export function partialPressure(totalBar,moleFraction){
 if(!Number.isFinite(totalBar)||totalBar<=0)throw new RangeError('Total absolute pressure must be positive');
 if(!Number.isFinite(moleFraction)||moleFraction<0||moleFraction>1)throw new RangeError('Mole fraction must be between 0 and 1');
 return totalBar*moleFraction;
}
export function percentToFraction(percent){
 if(!Number.isFinite(percent)||percent<0||percent>100)throw new RangeError('Percent must be between 0 and 100');
 return percent/100;
}
export function ppmToFraction(ppm){
 if(!Number.isFinite(ppm)||ppm<0||ppm>1e6)throw new RangeError('ppmv must be between 0 and 1,000,000');
 return ppm/1e6;
}
export function fractionToPpm(fraction){
 if(!Number.isFinite(fraction)||fraction<0||fraction>1)throw new RangeError('Mole fraction must be between 0 and 1');
 return fraction*1e6;
}
