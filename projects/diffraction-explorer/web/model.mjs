export const VERSION = '0.1.0';
export function bragg({mode='spacing',value=3,wavelength=1.5406,order=1}={}) {
  if (![value,wavelength,order].every(Number.isFinite) || value<=0 || wavelength<=0 || !Number.isInteger(order) || order<1) throw Error('Use positive finite values and a positive integer diffraction order.');
  let sine;
  if(mode==='spacing') sine=order*wavelength/(2*value);
  else if(mode==='angle') { if(value>180) throw Error('2θ must be greater than 0° and at most 180°.'); sine=Math.sin(value*Math.PI/360); }
  else if(mode==='q') sine=value*wavelength/(4*Math.PI);
  else throw Error('Unknown input quantity.');
  if(sine>1+1e-12) throw Error('No physical Bragg angle: nλ exceeds 2d (or q exceeds 4π/λ).');
  sine=Math.min(1,sine);
  if(sine<=0 || !Number.isFinite(order*wavelength/(2*sine)) || !Number.isFinite(4*Math.PI*sine/wavelength)) throw Error('Values exceed the supported numerical range.');
  const theta=Math.asin(sine);
  return {theta:theta*180/Math.PI,twoTheta:theta*360/Math.PI,spacing:order*wavelength/(2*sine),q:4*Math.PI*sine/wavelength,pathDifference:order*wavelength,wavelength,order};
}
