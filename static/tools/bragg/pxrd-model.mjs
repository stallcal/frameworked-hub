// Positions only. This geometric bridge does not calculate powder intensities,
// structure factors, systematic absences, peak widths, or phase identification.
export const PXRD_EXAMPLE_A = 4;             // angstrom, illustrative primitive cubic lattice
export const PXRD_EXAMPLE_LAMBDA = 1.5406;   // angstrom, Cu Kα1

const radToDeg = 180 / Math.PI;

export function cubicReflection({ a, wavelength, h, k, l }) {
  if (![a, wavelength, h, k, l].every(Number.isFinite) ||
      a <= 0 || wavelength <= 0 ||
      ![h, k, l].every(n => Number.isInteger(n) && n >= 0) ||
      h + k + l === 0) {
    throw Error("Provide positive a and wavelength, and nonnegative integer hkl not all zero.");
  }
  const sum = h * h + k * k + l * l;
  const d = a / Math.sqrt(sum);
  const ratio = wavelength / (2 * d);
  return {
    h, k, l, label: "(" + h + k + l + ")", d,
    twoTheta: ratio > 1 ? null : 2 * radToDeg * Math.asin(Math.min(1, ratio))
  };
}

export function simpleCubicExamples({
  a = PXRD_EXAMPLE_A, wavelength = PXRD_EXAMPLE_LAMBDA
} = {}) {
  return [[1,0,0], [1,1,0], [1,1,1], [2,0,0]]
    .map(([h,k,l]) => cubicReflection({a,wavelength,h,k,l}));
}

export function spacingFromTwoTheta({ twoTheta, wavelength = PXRD_EXAMPLE_LAMBDA }) {
  if (![twoTheta, wavelength].every(Number.isFinite) ||
      twoTheta <= 0 || twoTheta >= 180 || wavelength <= 0) {
    throw Error("Enter a 2θ angle greater than 0° and less than 180° and a positive wavelength.");
  }
  return wavelength / (2 * Math.sin(twoTheta * Math.PI / 360));
}
