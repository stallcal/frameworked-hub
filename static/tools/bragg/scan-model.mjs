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


/**
 * Geometrically allowed reinforcement orders in the displayed 2θ interval.
 * An order is NOT necessarily an experimentally observable reflection:
 * structure factors and selection rules are outside this model.
 * Cap the enumeration to keep the educational view legible for extreme
 * custom wavelengths; return truncated=true to disclose that limitation.
 */
export function predictedBraggOrders({
  spacing, wavelength, minAngle = SCAN_MIN_ANGLE,
  maxAngle = SCAN_MAX_ANGLE, limit = 40
} = {}) {
  if (![spacing, wavelength, minAngle, maxAngle].every(Number.isFinite) ||
      spacing <= 0 || wavelength <= 0 || minAngle < 0 ||
      maxAngle > 180 || minAngle >= maxAngle ||
      !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw Error("Invalid plane spacing, wavelength, scan bounds or peak limit.");
  }
  const ratio = 2 * spacing / wavelength;
  if (!Number.isFinite(ratio) || ratio > 1e9) {
    throw Error("Too many orders to resolve with this idealized scan; increase λ or decrease d.");
  }
  const totalOrders = Math.max(0, Math.floor(ratio + 1e-12));
  const first = Math.max(1, Math.ceil(ratio * Math.sin(minAngle * Math.PI / 360) - 1e-12));
  const last = Math.min(totalOrders, Math.floor(ratio * Math.sin(maxAngle * Math.PI / 360) + 1e-12));
  const visibleOrders = Math.max(0, last - first + 1);
  const count = Math.min(limit, visibleOrders);
  const truncated = visibleOrders > count;
  const peaks = [];
  for (let index = 0; index < count; index++) {
    // When there are too many orders to label, show a representative subset
    // spanning the entire angular range instead of falsely returning no peaks.
    const order = truncated
      ? first + Math.round(index * (visibleOrders - 1) / Math.max(1, count - 1))
      : first + index;
    const sine = Math.min(1, order / ratio);
    const twoTheta = 360 / Math.PI * Math.asin(sine);
    peaks.push({ order, twoTheta });
  }
  return { peaks, totalOrders, visibleOrders, truncated };
}
