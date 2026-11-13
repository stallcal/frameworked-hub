// Ideal coherent, same-frequency 1D sinusoidal waves at a fixed time.
// x is dimensionless position measured in wavelengths, and amplitudes
// are relative units. This is classical field superposition, not quantum
// probability or a diffraction-intensity simulator.
const radians = degrees => degrees * Math.PI / 180;

export function validateWaves({phase, a1=1, a2=1}) {
  if (![phase,a1,a2].every(Number.isFinite) ||
      phase < 0 || phase > 360 || a1 < 0 || a2 < 0 ||
      a1 > 10 || a2 > 10) {
    throw Error("Choose finite phase (0–360°) and nonnegative amplitudes (0–10).");
  }
}
export function resultantAmplitude({phase,a1=1,a2=1}) {
  validateWaves({phase,a1,a2});
  const magnitude = Math.hypot(a1 + a2 * Math.cos(radians(phase)),
                               a2 * Math.sin(radians(phase)));
  return magnitude < 1e-12 ? 0 : magnitude;
}
export function wavesAt(x,{phase,a1=1,a2=1}) {
  validateWaves({phase,a1,a2});
  if (!Number.isFinite(x)) throw Error("x must be a finite number.");
  const argument=2*Math.PI*x;
  const waveA=a1*Math.sin(argument);
  const waveB=a2*Math.sin(argument+radians(phase));
  return {waveA,waveB,sum:waveA+waveB};
}
export function phaseToPathDifference(phase) {
  validateWaves({phase});
  return phase/360; // ΔL / λ, modulo integer-wavelength shifts
}
export function sampleWaves(state,count=241) {
  validateWaves(state);
  if (!Number.isInteger(count)||count<2||count>2000)
    throw Error("Choose between 2 and 2000 samples.");
  return Array.from({length:count},(_,i)=>{
    const x=2*i/(count-1);
    return {x,...wavesAt(x,state)};
  });
}
