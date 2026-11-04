export const VERSION = "0.1.0";
export function bragg({
  mode = "spacing",
  value = 3,
  wavelength = 1.5406,
  order = 1,
} = {}) {
  if (
    ![value, wavelength, order].every(Number.isFinite) ||
    value <= 0 ||
    wavelength <= 0 ||
    !Number.isInteger(order) ||
    order < 1
  )
    throw Error(
      "Use positive finite values and a positive integer diffraction order.",
    );
  let sine;
  if (mode === "spacing") sine = (order * wavelength) / (2 * value);
  else if (mode === "angle") {
    if (value > 180)
      throw Error("2θ must be greater than 0° and at most 180°.");
    sine = Math.sin((value * Math.PI) / 360);
  } else if (mode === "q") sine = (value * wavelength) / (4 * Math.PI);
  else throw Error("Unknown input quantity.");
  if (sine > 1 + 1e-12)
    throw Error("No physical Bragg angle: nλ exceeds 2d (or q exceeds 4π/λ).");
  sine = Math.min(1, sine);
  if (
    sine <= 0 ||
    !Number.isFinite((order * wavelength) / (2 * sine)) ||
    !Number.isFinite((4 * Math.PI * sine) / wavelength)
  )
    throw Error("Values exceed the supported numerical range.");
  const theta = Math.asin(sine);
  return {
    theta: (theta * 180) / Math.PI,
    twoTheta: (theta * 360) / Math.PI,
    spacing: (order * wavelength) / (2 * sine),
    q: (4 * Math.PI * sine) / wavelength,
    pathDifference: order * wavelength,
    wavelength,
    order,
  };
}


/**
 * Spacing of selected reciprocal-lattice plane families in a 2D square lattice.
 * a and d are in angstroms; 2D Miller-style indices are illustrative.
 * The (10) and (11) cases are explicitly curated, not arbitrary plane indexing.
 */
export function squareLatticeSpacing({a = 4, plane = "10"} = {}) {
  if (!Number.isFinite(a) || a <= 0) throw Error("Lattice parameter a must be a positive finite length (Å).");
  if (!["10", "11"].includes(plane)) throw Error("Only the illustrated (10) and (11) plane families are available.");
  const h = Number(plane[0]), k = Number(plane[1]);
  const d = a / Math.hypot(h, k);
  return { a, h, k, plane, d };
}


/**
 * Phase-only demonstration for TWO equally weighted contributions from adjacent planes.
 * This is not a structure-factor or full-crystal scattering intensity calculation.
 * Input spacing and wavelength use the same length unit (Å in the UI).
 * twoTheta is the scattering angle in degrees.
 */
export function twoPlaneInterference({spacing,wavelength,twoTheta}={}){
  if(![spacing,wavelength,twoTheta].every(Number.isFinite)||spacing<=0||wavelength<=0||twoTheta<0||twoTheta>180)
    throw Error("Two-plane interference requires positive lengths and a 2θ angle from 0° to 180°.");
  const theta=twoTheta*Math.PI/360;
  const pathDifference=2*spacing*Math.sin(theta);
  const cycles=pathDifference/wavelength;
  if(!Number.isFinite(cycles))throw Error("Interference ratio exceeds supported numerical range.");
  // Sum two unit phasors: |1+exp(iφ)|²/4 = cos²(φ/2).
  const reducedCycles=cycles-Math.round(cycles);
  const relativePhase=2*Math.PI*reducedCycles;
  const relativeIntensity=Math.pow(Math.cos(relativePhase/2),2);
  return {twoTheta,theta:theta*180/Math.PI,pathDifference,cycles,relativePhase,relativeIntensity};
}

/**
 * Compare the n-th Bragg condition to an intentionally half-cycle-shifted
 * off-Bragg direction: Δpath=(n-0.5)λ. Both conditions are physically possible
 * whenever the n-th Bragg condition is possible. Two-plane cancellation is an
 * illustrative limit; real finite crystals can still scatter off-Bragg.
 */
export function compareTwoPlaneInterference({spacing,wavelength,order=1}={}){
  const valid=bragg({mode:"spacing",value:spacing,wavelength,order});
  const on=twoPlaneInterference({spacing,wavelength,twoTheta:valid.twoTheta});
  const offCycles=order-0.5;
  const offTheta=Math.asin(offCycles*wavelength/(2*spacing));
  const off=twoPlaneInterference({spacing,wavelength,twoTheta:2*offTheta*180/Math.PI});
  return {on,off,order,spacing,wavelength,assumptions:"Two equal-amplitude plane contributions; no crystal-size, atomic basis, or instrument model"};
}
