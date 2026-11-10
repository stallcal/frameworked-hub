import { bragg, squareLatticeSpacing } from "./model.mjs";
import {
  finitePlaneInterference, finitePlaneScan,
  SCAN_MIN_ANGLE, SCAN_MAX_ANGLE, DEFAULT_PLANE_COUNT
} from "./scan-model.mjs";

// Independent educational scan: the existing Bragg calculator remains the
// source of diffraction geometry, while this module adds an ideal N-plane
// coherent response without changing existing app controls or calculations.
const el = id => document.getElementById(id);
const num = id => Number(el(id).value);
const format = (v, digits = 2) => Number(v).toFixed(digits);
let followPeak = true;

function readConditions() {
  const wavelength = num("wavelength");
  const guided = !el("advancedPanel").open;
  if (!Number.isFinite(wavelength) || wavelength <= 0)
    throw Error("Enter a positive, finite X-ray wavelength to scan.");
  let spacing, order;
  if (guided) {
    const a = num("latticeA");
    if (!Number.isFinite(a) || a < 2 || a > 12)
      throw Error("Choose a lattice parameter from 2 to 12 Å.");
    spacing = squareLatticeSpacing({
      a, plane: el("planeFamily").value
    }).d;
    order = 1;
  } else {
    order = num("order");
    const inferred = bragg({
      mode: el("mode").value, value: num("value"),
      wavelength, order
    });
    spacing = inferred.spacing;
  }
  let predicted = null;
  try {
    predicted = bragg({
      mode: "spacing", value: spacing, wavelength, order
    }).twoTheta;
  } catch {
    // A finite interference factor can be plotted even when no nth-order
    // Bragg maximum exists in the physical reflection-angle range.
  }
  return { spacing, wavelength, predicted, order, guided };
}

function point(x, y) {
  return format(x, 2) + " " + format(y, 2);
}

function drawPhasors(result) {
  const elements = [];
  const n = result.planes;
  elements.push('<rect x="1" y="1" width="498" height="238" rx="7" fill="#f5f8fc"/>');
  elements.push('<text x="17" y="22" fill="#1c3049" font-size="13" font-weight="700">Equally spaced planes</text>');
  for (let j = 0; j < n; j++) {
    const y = 42 + j * 22;
    elements.push('<line x1="17" y1="' + y + '" x2="148" y2="' + y +
      '" stroke="#91abc9" stroke-width="2"/>');
    elements.push('<circle cx="116" cy="' + y + '" r="3.5" fill="#084b9e"/>');
  }
  elements.push('<text x="17" y="235" font-size="11" fill="#5a708b">N = ' + n + ' coherent contributions</text>');
  elements.push('<path d="M166 22V218" stroke="#ccd9e8" stroke-width="1.5"/>');
  elements.push('<text x="181" y="22" fill="#1c3049" font-size="13" font-weight="700">Complex phase vectors</text>');
  // The arrows below represent complex amplitudes, not physical X-ray paths.
  const originX = 296, originY = 122, length = 18.5;
  let x = originX, y = originY;
  elements.push('<circle cx="' + originX + '" cy="' + originY +
    '" r="4" fill="#1c3049"/>');
  for (const p of result.phasors) {
    const nextX = x + length * p.real;
    const nextY = y - length * p.imag;
    elements.push('<line x1="' + format(x) + '" y1="' + format(y) +
      '" x2="' + format(nextX) + '" y2="' + format(nextY) +
      '" stroke="#084b9e" stroke-width="3.2" stroke-linecap="round"/>');
    elements.push('<circle cx="' + format(nextX) + '" cy="' +
      format(nextY) + '" r="2.3" fill="#084b9e"/>');
    x = nextX;
    y = nextY;
  }
  elements.push('<line x1="' + originX + '" y1="' + originY +
    '" x2="' + format(x) + '" y2="' + format(y) +
    '" stroke="#9e382e" stroke-width="3.3" stroke-linecap="round" stroke-dasharray="7 4"/>');
  elements.push('<circle cx="' + format(x) + '" cy="' + format(y) +
    '" r="4.5" fill="#9e382e"/>');
  elements.push('<line x1="183" y1="209" x2="209" y2="209" stroke="#084b9e" stroke-width="3"/>');
  elements.push('<text x="215" y="213" font-size="11" fill="#1c3049">Plane amplitudes</text>');
  elements.push('<line x1="362" y1="209" x2="388" y2="209" stroke="#9e382e" stroke-dasharray="6 3" stroke-width="3"/>');
  elements.push('<text x="394" y="213" font-size="11" fill="#1c3049">Resultant</text>');
  el("scanPhasors").innerHTML = elements.join("");
}

function drawPlot(points, measured, selectedAngle, predicted) {
  const x0 = 50, y0 = 20, width = 566, height = 207;
  const x = angle => x0 + (angle - SCAN_MIN_ANGLE) /
    (SCAN_MAX_ANGLE - SCAN_MIN_ANGLE) * width;
  const y = intensity => y0 + (1 - intensity) * height;
  const svg = [];
  svg.push('<rect x="1" y="1" width="638" height="277" rx="7" fill="#fff"/>');
  for (const level of [0, 0.5, 1]) {
    const py = y(level);
    svg.push('<path d="M' + point(x0, py) + 'H616" stroke="#d9e3ef" stroke-width="1" />');
    svg.push('<text x="42" y="' + format(py + 4) +
      '" text-anchor="end" font-size="12" fill="#526981">' +
      format(level, 1) + '</text>');
  }
  for (const degree of [20, 60, 100, 140, 178]) {
    svg.push('<line x1="' + format(x(degree)) + '" y1="227" x2="' +
      format(x(degree)) + '" y2="233" stroke="#70839a"/>');
    svg.push('<text x="' + format(x(degree)) +
      '" y="250" text-anchor="middle" font-size="12" fill="#526981">' +
      degree + '°</text>');
  }
  const curve = points.map((p, i) =>
    (i === 0 ? "M" : "L") + point(x(p.twoTheta), y(p.normalizedIntensity))
  ).join(" ");
  svg.push('<path d="' + curve + '" stroke="#084b9e" stroke-width="2.8" fill="none" stroke-linejoin="round"/>');
  if (predicted !== null && predicted >= SCAN_MIN_ANGLE && predicted <= SCAN_MAX_ANGLE) {
    svg.push('<line x1="' + format(x(predicted)) + '" y1="20" x2="' +
      format(x(predicted)) +
      '" y2="227" stroke="#089e4b" stroke-width="2" stroke-dasharray="6 5"/>');
  }
  svg.push('<line x1="' + format(x(selectedAngle)) + '" y1="20" x2="' +
    format(x(selectedAngle)) +
    '" y2="227" stroke="#9e382e" stroke-width="1.6" stroke-dasharray="4 4"/>');
  svg.push('<circle cx="' + format(x(selectedAngle)) + '" cy="' +
    format(y(measured.normalizedIntensity)) +
    '" r="5.5" fill="#9e382e" stroke="#fff" stroke-width="2"/>');
  svg.push('<text x="333" y="270" text-anchor="middle" font-size="13" fill="#1c3049">Detector angle · 2θ (°)</text>');
  svg.push('<text x="13" y="124" text-anchor="middle" transform="rotate(-90 13 124)" font-size="12" fill="#1c3049">Relative response</text>');
  el("scanIntensity").innerHTML = svg.join("");
}

function render() {
  try {
    const { spacing, wavelength, predicted, order, guided } = readConditions();
    const canSnap = predicted !== null &&
      predicted >= SCAN_MIN_ANGLE && predicted <= SCAN_MAX_ANGLE;
    if (followPeak && canSnap) el("scanTwoTheta").value = format(predicted, 1);
    const selectedAngle = num("scanTwoTheta");
    const measured = finitePlaneInterference({
      spacing, wavelength, twoTheta: selectedAngle,
      planes: DEFAULT_PLANE_COUNT
    });
    const curve = finitePlaneScan({
      spacing, wavelength, planes: DEFAULT_PLANE_COUNT
    });
    drawPhasors(measured);
    drawPlot(curve, measured, selectedAngle, predicted);
    el("scanTwoThetaValue").textContent = format(selectedAngle, 1) + "°";
    el("scanSnap").disabled = !canSnap;
    el("scanPeak").textContent = predicted === null
      ? "No " + (order === 1 ? "first-order" : "order-" + order) + " Bragg maximum is possible."
      : "Predicted order-" + order + " Bragg angle: 2θ = " +
        format(predicted) + "°" +
        (canSnap ? "" : " (outside the displayed scan).");
    const nearPeak = predicted !== null &&
      Math.abs(selectedAngle - predicted) < 0.15;
    el("scanResponse").textContent =
      "At 2θ = " + format(selectedAngle, 1) + "°, the adjacent-plane path difference is " +
      format(measured.pathDifference, 3) + " Å = " +
      format(measured.cycles, 3) + "λ. The normalized " +
      DEFAULT_PLANE_COUNT + "-plane interference factor is " +
      format(100 * measured.normalizedIntensity, 1) +
      "% of its ideal coherent maximum." +
      (nearPeak ? " This is a Bragg reinforcement condition." : "");
    el("scanContext").textContent = guided
      ? "Using the selected (10) or (11) spacing from the guided square lattice."
      : "Using an ideal plane stack with the spacing inferred from the advanced calculation.";
    el("scanError").textContent = "";
    el("scanPanels").hidden = false;
  } catch (error) {
    el("scanError").textContent = error.message;
    el("scanPanels").hidden = true;
    el("scanPeak").textContent = "";
    el("scanSnap").disabled = true;
  }
}

el("scanTwoTheta").addEventListener("input", () => {
  followPeak = false;
  render();
});
el("scanSnap").addEventListener("click", () => {
  followPeak = true;
  render();
});

for (const id of [
  "latticeSlider", "latticeA", "planeFamily", "preset", "wavelength",
  "mode", "value", "order", "spacing-slider"
]) {
  el(id).addEventListener("input", render);
  el(id).addEventListener("change", render);
}
el("advancedPanel").addEventListener("toggle", render);
el("reset").addEventListener("click", () => {
  followPeak = true;
  render();
});
el("tryMeasuredPeak").addEventListener("click", () => {
  followPeak = true;
  render();
});
render();
