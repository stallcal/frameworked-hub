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
export const SCAN_MIN_ANGLE = 2;
export const SCAN_MAX_ANGLE = 178;
export const DEFAULT_PLANE_COUNT = 8;

export function finitePlaneInterference({
  spacing, wavelength, twoTheta, planes = DEFAULT_PLANE_COUNT
} = {}) {
  if (![spacing, wavelength, twoTheta].every(Number.isFinite) ||
      spacing <= 0 || wavelength <= 0 || twoTheta < 0 || twoTheta > 180 ||
      !Number.isInteger(planes) || planes < 2 || planes > 64) {
    throw Error("Use positive d and λ, a 2θ angle from 0° to 180°, and 2–64 planes.");
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

export function finitePlaneScan({
  spacing, wavelength, planes = DEFAULT_PLANE_COUNT,
  minAngle = SCAN_MIN_ANGLE, maxAngle = SCAN_MAX_ANGLE, steps = 440
} = {}) {
  if (!Number.isFinite(minAngle) || !Number.isFinite(maxAngle) ||
      minAngle < 0 || maxAngle > 180 || minAngle >= maxAngle ||
      !Number.isInteger(steps) || steps < 2 || steps > 3000) {
    throw Error("Invalid detector scan limits or sampling.");
  }
  // Validate the physical inputs once, then sample across the same angular axis.
  return Array.from({ length: steps + 1 }, (_, i) =>
    finitePlaneInterference({
      spacing, wavelength, planes,
      twoTheta: minAngle + (maxAngle - minAngle) * i / steps
    })
  );
}
