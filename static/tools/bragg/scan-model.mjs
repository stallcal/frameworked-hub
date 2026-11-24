/**
 * Finite, equally weighted plane-stack interference.
 *
 * The path increment between adjacent planes is Δ = 2d sin(θ),
 * with θ = (2θ)/2. For N equal complex amplitudes:
 * F = |sum_{j=0}^{N-1} exp(i j φ)|² / N²,
 * φ = 2πΔ/λ. This is a normalized interference factor,
 * NOT an absolute diffracted intensity or PXRD structure-factor model.
 * d and λ have the same units (Å in the Bragg UI); 2θ is in degrees.
 */
export const SCAN_MIN_ANGLE = 0;
export const SCAN_MAX_ANGLE = 120;
export const DEFAULT_PLANE_COUNT = 8;

export function finitePlaneInterference({
  spacing, wavelength, twoTheta, planes = DEFAULT_PLANE_COUNT
} = {}) {
  if (![spacing, wavelength, twoTheta].every(Number.isFinite) ||
      spacing <= 0 || wavelength <= 0 || twoTheta < 0 || twoTheta > 180 ||
      !Number.isInteger(planes) || planes < 2 || planes > 20) {
    throw Error("Use positive d and λ, a 2θ angle from 0° to 180°, and 2–20 planes.");
  }
  const theta = twoTheta * Math.PI / 360;
  const pathDifference = 2 * spacing * Math.sin(theta);
  const cycles = pathDifference / wavelength;
  if (!Number.isFinite(cycles) || Math.abs(cycles) > 1e9) {
    throw Error("The wavelength-to-spacing ratio is outside the scan's numerical range.");
  }
  // Reduce by whole cycles before taking trig functions for stable phase math.
  const phase = 2 * Math.PI * (cycles - Math.floor(cycles));
  const phasors = [];
  let real = 0, imaginary = 0;
  for (let j = 0; j < planes; j++) {
    const re = Math.cos(j * phase), im = Math.sin(j * phase);
    phasors.push({ real: re, imaginary: im });
    real += re;
    imaginary += im;
  }
  const amplitude = Math.hypot(real, imaginary) / planes;
  return {
    twoTheta, theta: theta * 180 / Math.PI,
    pathDifference, cycles, phase, planes, phasors,
    real, imaginary,
    normalizedIntensity: Math.max(0, Math.min(1, amplitude * amplitude))
  };
}


// Limit plot complexity rather than showing an aliased curve as reliable.
export function predictedBraggOrders({spacing,wavelength}={}) {
  if (![spacing,wavelength].every(Number.isFinite) || spacing<=0 || wavelength<=0)
    throw Error("Enter positive finite plane spacing and wavelength.");
  const ratio=2*spacing/wavelength;
  if (!Number.isFinite(ratio) || ratio<=0 || ratio*Math.sin(Math.PI/3)>60)
    throw Error("Too many reinforcement orders for this educational plot. Increase wavelength or decrease spacing.");
  const maxCycles=ratio*Math.sin(Math.PI/3);
  const peaks=[];
  for(let order=1;order<=Math.floor(maxCycles+1e-12);order++){
    const angle=360/Math.PI*Math.asin(Math.min(1,order/ratio));
    if(angle<=SCAN_MAX_ANGLE+1e-9) peaks.push({order,twoTheta:Math.min(angle,SCAN_MAX_ANGLE)});
  }
  return peaks;
}

export function finitePlaneScan({spacing,wavelength,planes=DEFAULT_PLANE_COUNT}={}) {
  const peaks=predictedBraggOrders({spacing,wavelength});
  const ratio=2*spacing/wavelength;
  const maxCycles=ratio*Math.sin(Math.PI/3);
  // Resolve the narrowest fringes in phase space and retain exact maxima.
  const steps=Math.max(1,Math.ceil(maxCycles*planes*16));
  const angles=new Set(Array.from({length:721},(_,i)=>i/6));
  for(let i=0;i<=steps;i++){
    const sine=Math.min(Math.sin(Math.PI/3),maxCycles*i/steps/ratio);
    angles.add(360/Math.PI*Math.asin(sine));
  }
  for(const peak of peaks) angles.add(peak.twoTheta);
  return [...angles].filter(a=>a>=0&&a<=120).sort((a,b)=>a-b)
    .map(twoTheta=>finitePlaneInterference({spacing,wavelength,twoTheta,planes}));
}
