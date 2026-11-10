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
    assert.match(el("scanPeak").textContent, /22\.21°/);

    const initial = el("scanResponse").textContent;
    el("scanTwoTheta").value = "45";
    for (const fn of el("scanTwoTheta").handlers.input) fn();
    assert.equal(el("scanTwoThetaValue").textContent, "45.0°");
    assert.notEqual(el("scanResponse").textContent, initial);

    el("latticeA").value = "5";
    for (const fn of el("latticeA").handlers.input) fn();
    assert.match(el("scanPeak").textContent, /17\.72°/);
    // Once the visitor manually scans, do not silently move their detector.
    assert.equal(el("scanTwoThetaValue").textContent, "45.0°");

    for (const fn of el("scanSnap").handlers.click) fn();
    assert.equal(el("scanTwoThetaValue").textContent, "17.7°");

    el("advancedPanel").open = true;
    for (const fn of el("advancedPanel").handlers.toggle) fn();
    assert.match(el("scanContext").textContent, /advanced calculation/);
    assert.equal(el("scanPanels").hidden, false);
  } finally {
    delete globalThis.document;
  }
});
