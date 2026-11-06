// SI constants; electron mass from CODATA 2022. Display lengths are nm.
const H = 6.62607015e-34, ME = 9.1093837139e-31, EV = 1.602176634e-19;
export const R = 8.31446261815324;
export function boxEnergy(n, length) { return H ** 2 * n ** 2 / (8 * ME * (length * 1e-9) ** 2) / EV; }
export function wave(n, fraction) { return Math.SQRT2 * Math.sin(n * Math.PI * fraction); }
export function probability(n, a, b) {
  return b - a - (Math.sin(2 * n * Math.PI * b) - Math.sin(2 * n * Math.PI * a)) / (2 * n * Math.PI);
}
// Two nondegenerate states at thermal equilibrium; gap in kJ/mol, T in kelvin.
export function populations(gap, temperature) {
  const ratio = Math.exp(-gap * 1000 / (R * temperature));
  return { upper: ratio / (1 + ratio), lower: 1 / (1 + ratio), ratio };
}
// Hypothetical absorber at one fixed wavelength, epsilon = 10,000 L mol^-1 cm^-1.
export function absorption(concentration, path) {
  const absorbance = 10000 * concentration * 1e-6 * path;
  return { absorbance, transmission: 10 ** -absorbance };
}
