import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_PLANE_COUNT, finitePlaneInterference, finitePlaneScan,
  SCAN_MIN_ANGLE, SCAN_MAX_ANGLE
} from "../static/tools/bragg/scan-model.mjs";

const spacing = 4, wavelength = 1.5406;
const predictedTwoTheta = 360 / Math.PI * Math.asin(wavelength / (2 * spacing));

test("eight equal plane contributions reinforce at first-order Bragg angle", () => {
  const r = finitePlaneInterference({ spacing, wavelength, twoTheta: predictedTwoTheta });
  assert.ok(Math.abs(r.normalizedIntensity - 1) < 1e-12);
  assert.ok(Math.abs(r.pathDifference - wavelength) < 1e-12);
  assert.equal(r.phasors.length, DEFAULT_PLANE_COUNT);
});

test("eight planes exactly cancel when adjacent phases differ by one-eighth turn", () => {
  const twoTheta = 360 / Math.PI * Math.asin(wavelength / (16 * spacing));
  const r = finitePlaneInterference({ spacing, wavelength, twoTheta });
  assert.ok(Math.abs(r.cycles - 1/8) < 1e-12);
  assert.ok(r.normalizedIntensity < 1e-24);
});

test("half-integer path offset cancels even N; finite off-Bragg signal is not always zero", () => {
  const angleForCycles = c => 360 / Math.PI * Math.asin(c * wavelength / (2 * spacing));
  assert.ok(finitePlaneInterference({
    spacing, wavelength, twoTheta: angleForCycles(0.5)
  }).normalizedIntensity < 1e-24);
  const partial = finitePlaneInterference({
    spacing, wavelength, twoTheta: angleForCycles(0.1)
  }).normalizedIntensity;
  assert.ok(partial > 0 && partial < 1);
});

test("intensity curve is finite, normalized and spans the detector slider", () => {
  const points = finitePlaneScan({ spacing, wavelength });
  assert.equal(points.length, 441);
  assert.equal(points[0].twoTheta, SCAN_MIN_ANGLE);
  assert.equal(points.at(-1).twoTheta, SCAN_MAX_ANGLE);
  assert.ok(points.every(p => Number.isFinite(p.normalizedIntensity) &&
    p.normalizedIntensity >= 0 && p.normalizedIntensity <= 1));
});

test("finite-stack model rejects unphysical lengths, angles and plane counts", () => {
  for (const values of [
    { spacing: -1, wavelength, twoTheta: 20 },
    { spacing, wavelength: 0, twoTheta: 20 },
    { spacing, wavelength, twoTheta: 181 },
    { spacing, wavelength, twoTheta: -2 },
    { spacing, wavelength, twoTheta: 20, planes: 1 },
    { spacing, wavelength, twoTheta: 20, planes: 3.5 }
  ]) {
    assert.throws(() => finitePlaneInterference(values));
  }
});

test("scan is attached without removing the existing Bragg ray and disclosures", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  assert.match(html, /id="geometry"/);
  assert.match(html, /id="latticeSlider"/);
  assert.match(html, /id="advancedPanel"/);
  assert.match(html, /id="interferenceLesson"/);
  assert.match(html, /id="scanTwoTheta"/);
  assert.match(html, /id="scanSnap"/);
  assert.match(html, /id="scanPhasors"/);
  assert.match(html, /id="scanIntensity"/);
  assert.match(html, /src="\.\/scan-view\.mjs"/);
  assert.match(html, /not an experimental PXRD pattern/i);
});
