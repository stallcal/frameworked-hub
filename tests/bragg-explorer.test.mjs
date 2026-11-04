import test from "node:test";
import assert from "node:assert/strict";
import { bragg, squareLatticeSpacing, twoPlaneInterference, compareTwoPlaneInterference } from "../static/tools/bragg/model.mjs";
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test("known first-order geometry and scattering vector", () => {
  const r = bragg({ value: 1, wavelength: 1 });
  near(r.theta, 30);
  near(r.twoTheta, 60);
  near(r.q, 2 * Math.PI);
  near(r.pathDifference, 1);
});
test("spacing, 2theta, and q round trips for several orders and wavelengths", () => {
  for (const order of [1, 2, 3])
    for (const wavelength of [0.5, 1, 1.5406]) {
      const a = bragg({ value: 4, wavelength, order });
      near(
        bragg({ mode: "angle", value: a.twoTheta, wavelength, order }).spacing,
        4,
      );
      near(bragg({ mode: "q", value: a.q, wavelength, order }).spacing, 4);
      near(a.q, (2 * Math.PI * order) / 4);
    }
});
test("backscattering limit is 180 degrees in 2theta", () => {
  near(bragg({ value: 0.5, wavelength: 1 }).twoTheta, 180);
});
test("larger spacing lowers the first-order angle", () =>
  assert.ok(bragg({ value: 5 }).twoTheta < bragg({ value: 2 }).twoTheta));
test("rejects impossible, zero, nonfinite, and fractional-order inputs", () => {
  for (const args of [
    { value: 0 },
    { value: NaN },
    { wavelength: Infinity },
    { order: 1.5 },
    { order: 0 },
    { value: 0.1, wavelength: 1 },
    { mode: "angle", value: 181 },
    { mode: "q", value: 20, wavelength: 1 },
    { mode: "bad" },
  ])
    assert.throws(() => bragg(args));
});


test("square lattice plane spacing is a for (10) and a/sqrt(2) for (11)", () => {
  const side = squareLatticeSpacing({a:4,plane:"10"});
  const diagonal = squareLatticeSpacing({a:4,plane:"11"});
  near(side.d,4);
  near(diagonal.d,4/Math.sqrt(2));
  near(bragg({value:side.d,wavelength:1.5406}).twoTheta,2*180/Math.PI*Math.asin(1.5406/8));
  assert.ok(bragg({value:diagonal.d,wavelength:1.5406}).twoTheta >
            bragg({value:side.d,wavelength:1.5406}).twoTheta);
});
test("square lattice guided model validates the lattice and curated plane family", () => {
  for (const config of [{a:0},{a:-1},{a:NaN},{a:Infinity},{a:4,plane:"21"}])
    assert.throws(()=>squareLatticeSpacing(config));
  assert.throws(()=>bragg({value:squareLatticeSpacing({a:0.5,plane:"11"}).d,wavelength:1.5406}));
});

test("equal-amplitude two-plane interference reinforces on-Bragg and cancels for a half-cycle path difference", () => {
  const {on,off}=compareTwoPlaneInterference({spacing:4,wavelength:1.5406,order:1});
  near(on.pathDifference,1.5406);
  near(off.pathDifference,0.7703);
  near(on.cycles,1);
  near(off.cycles,0.5);
  near(on.relativeIntensity,1);
  near(off.relativeIntensity,0);
  assert.ok(off.twoTheta<on.twoTheta);
});
test("two-plane illustration follows current plane spacing and diffraction order",()=>{
  const a=compareTwoPlaneInterference({spacing:4,wavelength:1.5406,order:1});
  const b=compareTwoPlaneInterference({spacing:5,wavelength:1.5406,order:1});
  assert.ok(b.on.twoTheta<a.on.twoTheta);
  assert.ok(b.off.twoTheta<a.off.twoTheta);
  const higher=compareTwoPlaneInterference({spacing:4,wavelength:1.5406,order:2});
  near(higher.off.cycles,1.5);
  near(higher.off.relativeIntensity,0);
  near(higher.on.relativeIntensity,1);
});
test("two-plane phase calculation rejects invalid values and does not claim unreachable higher-order reflection",()=>{
  for(const args of [
    {spacing:0,wavelength:1,twoTheta:20},
    {spacing:4,wavelength:0,twoTheta:20},
    {spacing:4,wavelength:1,twoTheta:181},
    {spacing:4,wavelength:1,twoTheta:NaN}
  ])assert.throws(()=>twoPlaneInterference(args));
  assert.throws(()=>compareTwoPlaneInterference({spacing:1,wavelength:2,order:2}));
});
