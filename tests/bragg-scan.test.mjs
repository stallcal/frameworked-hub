import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_PLANE_COUNT, finitePlaneInterference, finitePlaneScan, predictedBraggOrders,
  SCAN_MIN_ANGLE, SCAN_MAX_ANGLE
} from "../static/tools/bragg/scan-model.mjs";

import {
  PXRD_EXAMPLE_A, PXRD_EXAMPLE_LAMBDA, cubicReflection,
  simpleCubicExamples, spacingFromTwoTheta
} from "../static/tools/bragg/pxrd-model.mjs";

test("primitive cubic (100), (110), (111) and (200) spacings yield correct geometric positions", () => {
  assert.equal(PXRD_EXAMPLE_A, 4);
  assert.equal(PXRD_EXAMPLE_LAMBDA, 1.5406);
  const peaks = simpleCubicExamples();
  assert.deepEqual(peaks.map(p => p.label), ["(100)", "(110)", "(111)", "(200)"]);
  const expectedD = [4, 4 / Math.sqrt(2), 4 / Math.sqrt(3), 2];
  const expectedTwoTheta = [22.20619307666478,31.607375344652095,38.96873821328758,45.306105520893105];
  peaks.forEach((p, index) => {
    assert.ok(Math.abs(p.d-expectedD[index]) < 1e-10);
    assert.ok(Math.abs(p.twoTheta-expectedTwoTheta[index]) < 1e-10);
    assert.ok(p.twoTheta > 0 && p.twoTheta < 180);
  });
  // Higher orders of (100) are conventionally indexed as (200), etc.
  assert.ok(Math.abs(peaks[3].twoTheta -
    360 / Math.PI * Math.asin(2 * PXRD_EXAMPLE_LAMBDA / (2 * PXRD_EXAMPLE_A))) < 1e-10);
});

test("measured PXRD angle maps to interplanar spacing and not pore diameter", () => {
  const d = spacingFromTwoTheta({ twoTheta: 5, wavelength: 1.5406 });
  assert.ok(Math.abs(d-17.659578607748895) < 1e-10);
  const recovered = cubicReflection({ a: 4, h: 1, k: 0, l: 0, wavelength: 1.5406 });
  assert.ok(Math.abs(spacingFromTwoTheta({ twoTheta: recovered.twoTheta, wavelength: 1.5406 }) - 4) < 1e-12);
  for (const angle of [0,180,NaN,-5,181]) {
    assert.throws(() => spacingFromTwoTheta({ twoTheta: angle, wavelength: 1.5406 }));
  }
  assert.throws(() => spacingFromTwoTheta({ twoTheta: 5, wavelength: 0 }));
  assert.throws(() => cubicReflection({ a: 4, wavelength: 1.5406, h: 0, k: 0, l: 0 }));
});

test("the PXRD bridge is optional and explicitly distinguishes geometric from experimental intensities", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html",import.meta.url),"utf8");
  assert.match(html, /<details class="bragg-pxrd-bridge" id="pxrdBridge">/);
  assert.match(html, /separate example from the 2D square-lattice model/);
  assert.match(html, /not predicted experimental intensities/i);
  assert.match(html, /id="pxrdMeasuredAngle"/);
  assert.match(html, /id="pxrdMeasuredSpacing"/);
  assert.match(html, /id="braggModelLine"/);
  assert.match(html, /src="\.\/pxrd-view\.mjs"/);
  assert.ok(html.indexOf('id="pxrdBridge"') > html.indexOf('id="crystalSettings"'));
});

test("PXRD illustration renders indexed positions and converts a changed measured angle", async () => {
  const defaults = { pxrdMeasuredAngle: "5.00" };
  const nodes = new Map();
  const el = id => {
    if (!nodes.has(id)) {
      const node = { value: defaults[id] ?? "", innerHTML: "", textContent: "", handlers: {},
        addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); } };
      nodes.set(id,node);
    }
    return nodes.get(id);
  };
  globalThis.document = {getElementById:el};
  try {
    await import("../static/tools/bragg/pxrd-view.mjs");
    assert.match(el("pxrdPositionChart").innerHTML, /No intensities/);
    assert.match(el("pxrdReflectionRows").innerHTML, /\(111\)/);
    assert.equal(el("pxrdMeasuredSpacing").textContent, "17.66 Å");
    el("pxrdMeasuredAngle").value = "22.20619307666478";
    el("pxrdMeasuredAngle").handlers.input[0]();
    assert.equal(el("pxrdMeasuredSpacing").textContent,"4.00 Å");
    el("pxrdMeasuredAngle").value = "";
    el("pxrdMeasuredAngle").handlers.change[0]();
    assert.equal(el("pxrdMeasuredSpacing").textContent,"—");
    assert.match(el("pxrdConversionError").textContent,/greater than 0°/);
  } finally {
    delete globalThis.document;
  }
});

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

test("default geometry predicts five different accessible Bragg angles, not only 22 degrees", () => {
  const { peaks, totalOrders, truncated } = predictedBraggOrders({ spacing, wavelength });
  assert.equal(totalOrders, 5);
  assert.equal(peaks.length, 5);
  assert.equal(truncated, false);
  assert.deepEqual(peaks.map(p => p.order), [1, 2, 3, 4, 5]);
  assert.ok(Math.abs(peaks[0].twoTheta - predictedTwoTheta) < 1e-10);
  assert.ok(peaks.every(p => p.twoTheta >= SCAN_MIN_ANGLE &&
    p.twoTheta <= SCAN_MAX_ANGLE));
  assert.ok(peaks.slice(1).every((p, i) => p.twoTheta > peaks[i].twoTheta));
});

test("extreme but finite short wavelengths yield sampled peaks, never a false claim of no reflections", () => {
  const { peaks, visibleOrders, truncated } = predictedBraggOrders({
    spacing: 4, wavelength: 0.001
  });
  assert.equal(peaks.length, 40);
  assert.ok(visibleOrders > 40);
  assert.equal(truncated, true);
  assert.ok(peaks[0].twoTheta >= SCAN_MIN_ANGLE);
  assert.ok(peaks.at(-1).twoTheta <= SCAN_MAX_ANGLE);
  assert.ok(peaks.at(-1).twoTheta > peaks[0].twoTheta);
});

test("no peaks appear if the wavelength cannot meet an integer Bragg condition", () => {
  const { peaks, totalOrders } = predictedBraggOrders({ spacing: 4, wavelength: 20 });
  assert.equal(peaks.length, 0);
  assert.equal(totalOrders, 0);
});

test("scan is attached without removing the existing Bragg ray and disclosures", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  assert.match(html, /id="geometry"/);
  assert.match(html, /id="latticeSlider"/);
  assert.match(html, /id="advancedPanel"/);
  assert.match(html, /id="interferenceLesson"/);
  assert.match(html, /id="scanTwoTheta"/);
  assert.match(html, /id="scanSnap"/);
  assert.match(html, /id="scanPeakSelect"/);
  assert.match(html, /class="figure scan-plot-pane"/);
  assert.match(html, /id="scanPhasors"/);
  assert.match(html, /id="scanIntensity"/);
  assert.match(html, /src="\.\/scan-view\.mjs"/);
  assert.match(html, /not an experimental PXRD pattern/i);
});


test("two-wave explanation follows the core experiment, ahead of the optional PXRD bridge", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  const experiment = html.indexOf('id="braggActivity"');
  const waves = html.indexOf('id="interferenceLesson"');
  const pxrd = html.indexOf('id="pxrdBridge"');
  assert.ok(experiment >= 0 && experiment < waves && waves < pxrd);
  assert.match(html, /class="bragg-optional interference-bridge" id="interferenceLesson"/);
  assert.match(html, /These two reference cases are calculated for the current plane spacing and wavelength/);
  assert.match(html, /not<\/strong> the current position of the detector-angle slider/);
  assert.doesNotMatch(html, /<details class="bragg-optional interference-bridge" id="interferenceLesson" open/);
});

test("visual-first layout hides supporting data and crystal settings until requested", () => {
  const html = readFileSync(new URL("../static/tools/bragg/index.html", import.meta.url), "utf8");
  const idx = piece => html.indexOf(piece);
  assert.ok(idx('class="visual"') < idx('id="crystalSettings"'));
  assert.ok(idx('id="scanTwoTheta"') < idx('id="geometry"'));
  assert.ok(idx('id="geometry"') < idx('id="scanIntensity"'));
  assert.ok(idx('id="crystalSettings"') < idx('id="advancedPanel"'));
  assert.match(html, /<details class="bragg-more-details" id="braggMoreDetails">/);
  assert.match(html, /<details class="scan-peak-jump" id="scanPeakJump">/);
  assert.match(html, /id="scanPeakButtons"/);
  assert.doesNotMatch(html, /<details class="crystal-settings" id="crystalSettings" open/);
});

test("detector slider, lattice update, snap-to-peak and advanced mode recalculate the scan", async () => {
  const defaults = {
    wavelength: "1.5406", latticeA: "4", planeFamily: "10",
    mode: "spacing", value: "3", order: "1",
    scanTwoTheta: "22.2"
  };
  const nodes = new Map();
  function el(id) {
    if (!nodes.has(id)) {
      const node = {
        value: defaults[id] ?? "", open: false, hidden: false,
        disabled: false, textContent: "", innerHTML: "", handlers: {},
        addEventListener(event, fn) {
          (this.handlers[event] ||= []).push(fn);
        }
      };
      nodes.set(id, node);
    }
    return nodes.get(id);
  }
  globalThis.document = { getElementById: el };
  try {
    await import("../static/tools/bragg/scan-view.mjs");
    assert.match(el("scanPhasors").innerHTML, /N = 8/);
    assert.match(el("scanIntensity").innerHTML, /stroke="#084b9e"/);
    assert.match(el("scanPeak").textContent, /5 predicted reinforcement angles/);
    assert.match(el("scanIntensity").innerHTML, /data-order="5"/);
    assert.match(el("scanPeakButtons").innerHTML, /data-order="5"/);
    assert.match(el("scanStatus").textContent, /reinforce/);
    assert.match(el("ray-angle-display").textContent, /Scan/);
    assert.match(el("geometry").innerHTML, /refX="6"/);

    const initial = el("scanResponse").textContent;
    el("scanTwoTheta").value = "45";
    for (const fn of el("scanTwoTheta").handlers.input) fn();
    assert.equal(el("scanTwoThetaValue").textContent, "45.0°");
    assert.notEqual(el("scanResponse").textContent, initial);
    assert.match(el("ray-angle-display").textContent, /2θ 45\.00°/);

    el("latticeA").value = "5";
    for (const fn of el("latticeA").handlers.input) fn();
    assert.match(el("scanPeakSelect").innerHTML, /17\.7°/);
    // Once the visitor manually scans, do not silently move their detector.
    assert.equal(el("scanTwoThetaValue").textContent, "45.0°");

    for (const fn of el("scanSnap").handlers.click) fn();
    const secondOrderAngle = 360 / Math.PI * Math.asin(2 * wavelength / (2 * 5));
    assert.equal(el("scanTwoThetaValue").textContent, secondOrderAngle.toFixed(1) + "°");
    assert.match(el("scanPeakSelect").value, /^2$/);
    assert.match(el("ray-angle-display").textContent, /Scan/);
    el("scanPeakSelect").value = "3";
    for (const fn of el("scanPeakSelect").handlers.change) fn();
    assert.equal(el("scanPeakSelect").value, "3");
    const thirdOrderAngle = 360 / Math.PI * Math.asin(3 * wavelength / (2 * 5));
    assert.equal(el("scanTwoThetaValue").textContent, thirdOrderAngle.toFixed(1) + "°");

    // The accessible peak shortcuts jump without requiring the redundant dropdown.
    el("scanPeakButtons").handlers.click[0]({
      target: { closest: () => ({ getAttribute: () => "2" }) }
    });
    assert.equal(el("scanPeakSelect").value, "2");
    assert.ok(el("scanIntensity").innerHTML.includes('class="scan-peak-marker"'));
    assert.match(el("scanResponse").textContent, /Relative interference/);

    el("advancedPanel").open = true;
    for (const fn of el("advancedPanel").handlers.toggle) fn();
    assert.match(el("scanContext").textContent, /advanced Bragg calculation/);
    assert.equal(el("scanPanels").hidden, false);
  } finally {
    delete globalThis.document;
  }
});
