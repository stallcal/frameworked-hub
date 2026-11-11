import { bragg, squareLatticeSpacing } from "./model.mjs";
import {
  finitePlaneInterference, finitePlaneScan, predictedBraggOrders,
  SCAN_MIN_ANGLE, SCAN_MAX_ANGLE, DEFAULT_PLANE_COUNT
} from "./scan-model.mjs";

// One detector angle drives three synchronized depictions: scattering rays,
// finite-plane phase summation, and a normalized angular response.
const el = id => document.getElementById(id);
const num = id => Number(el(id).value);
const fmt = (v, places = 2) => Number(v).toFixed(places);
let followPeak = true;
let selectedOrder = 1;
let lastPeaks = [];
let lastOptionsKey = "";

function conditions() {
  const wavelength = num("wavelength");
  const guided = !el("advancedPanel").open;
  if (!Number.isFinite(wavelength) || wavelength <= 0)
    throw Error("Enter a positive, finite X-ray wavelength to scan.");
  let spacing;
  if (guided) {
    const a = num("latticeA");
    if (!Number.isFinite(a) || a < 2 || a > 12)
      throw Error("Choose a lattice parameter between 2 and 12 Å.");
    spacing = squareLatticeSpacing({ a, plane: el("planeFamily").value }).d;
  } else {
    const result = bragg({
      mode: el("mode").value, value: num("value"),
      wavelength, order: num("order")
    });
    spacing = result.spacing;
  }
  if (!Number.isFinite(spacing) || spacing <= 0)
    throw Error("Could not determine a valid plane spacing.");
  return { spacing, wavelength, guided };
}

function updateBraggChoices({ peaks, totalOrders, truncated }) {
  lastPeaks = peaks;
  if (!peaks.some(p => p.order === selectedOrder))
    selectedOrder = peaks.length ? peaks[0].order : 1;
  const selector = el("scanPeakSelect");
  const key = peaks.map(p => p.order + ":" + fmt(p.twoTheta, 3)).join("|");
  if (key !== lastOptionsKey) {
    selector.innerHTML = peaks.length
      ? peaks.map(p => '<option value="' + p.order + '">n = ' +
          p.order + ' · ' + fmt(p.twoTheta, 1) + '°</option>').join("")
      : '<option value="">No Bragg angle in scan</option>';
    lastOptionsKey = key;
  }
  selector.value = peaks.length ? String(selectedOrder) : "";
  selector.disabled = !peaks.length;
  el("scanSnap").disabled = !peaks.length;
  const summary = peaks.length
    ? peaks.length + " geometric Bragg " +
      (peaks.length === 1 ? "condition" : "conditions") +
      " in the scan: " +
      peaks.map(p => "n=" + p.order + " at " + fmt(p.twoTheta) + "°").join(" · ") + "."
    : "No geometric Bragg maximum lies between 2° and 178° for this spacing and wavelength.";
  el("scanPeak").textContent = summary + (truncated
    ? " Only the first 40 orders are enumerated for this model." : "") +
    " Higher orders are not guaranteed experimental reflections.";
}

function drawRay(selectedAngle, spacing, isPeak) {
  const theta = selectedAngle * Math.PI / 360;
  const cs = Math.cos(theta), sn = Math.sin(theta);
  const A = { x: 205, y: 190 }, B = { x: 258, y: 265 };
  const maxLength = (from, direction) =>
    Math.min(170,
      direction === "in" ? (from.x - 34) / Math.max(cs, 1e-6) : (490 - from.x) / Math.max(cs, 1e-6),
      (from.y - 32) / Math.max(sn, 1e-6));
  const inc = p => {
    const len = maxLength(p, "in");
    return 'M' + fmt(p.x - len * cs) + ' ' + fmt(p.y - len * sn) +
      'L' + fmt(p.x) + ' ' + fmt(p.y);
  };
  const out = p => {
    const len = maxLength(p, "out");
    return 'M' + fmt(p.x) + ' ' + fmt(p.y) +
      'L' + fmt(p.x + len * cs) + ' ' + fmt(p.y - len * sn);
  };
  const r = 66, small = 36;
  const thetaArc = 'M' + fmt(A.x + small) + ' ' + fmt(A.y) +
    'A' + small + ' ' + small + ' 0 0 0 ' +
    fmt(A.x + small * cs) + ' ' + fmt(A.y - small * sn);
  const twoArc = 'M' + fmt(A.x + r * cs) + ' ' + fmt(A.y + r * sn) +
    'A' + r + ' ' + r + ' 0 0 0 ' +
    fmt(A.x + r * cs) + ' ' + fmt(A.y - r * sn);
  el("ray-angle-display").textContent =
    "Scan: θ " + fmt(selectedAngle / 2) + "° · 2θ " + fmt(selectedAngle) + "°";
  el("geometry").innerHTML = '<defs>' +
      '<marker id="braggBlueArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#084b9e"/></marker>' +
      '<marker id="braggRedArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#9e382e"/></marker>' +
    '</defs>' +
    '<rect x="15" y="16" width="490" height="328" rx="9" fill="#f0f5fc" stroke="#d5e1f0"/>' +
    '<path d="M27 190H492M27 265H492" stroke="#90a8c4" stroke-width="2.4"/>' +
    '<path d="M469 190V265M463 190H475M463 265H475" stroke="#9e382e" stroke-width="2"/>' +
    '<text x="478" y="232" font-size="17" fill="#9e382e" font-family="system-ui,sans-serif">d</text>' +
    '<g stroke-width="3.6" fill="none">' +
      '<path d="' + inc(A) + '" stroke="#084b9e" stroke-linecap="butt" marker-end="url(#braggBlueArrow)"/>' +
      '<path d="' + out(A) + '" stroke="#9e382e" stroke-linecap="butt" marker-end="url(#braggRedArrow)"/>' +
      '<path d="' + inc(B) + '" stroke="#084b9e" opacity=".35"/>' +
      '<path d="' + out(B) + '" stroke="#9e382e" opacity=".35"/>' +
    '</g>' +
    '<path d="M' + A.x + ' ' + A.y + 'H' + (A.x + 145) + '" stroke="#657e99" stroke-width="1.3" stroke-dasharray="4 5"/>' +
    '<path d="' + twoArc + '" stroke="#9e382e" stroke-width="3.2" fill="none"/>' +
    '<path d="' + thetaArc + '" stroke="#084b9e" stroke-width="2.5" fill="none"/>' +
    '<g font-family="system-ui,sans-serif">' +
      '<text x="' + fmt(A.x + 47 * Math.cos(theta / 2)) + '" y="' +
        fmt(A.y - 47 * Math.sin(theta / 2) - 5) +
        '" font-size="18" font-weight="800" fill="#084b9e">θ</text>' +
      '<text x="' + (A.x + r + 12) + '" y="' + (A.y + 8) +
        '" font-size="18" font-weight="800" fill="#9e382e">2θ</text>' +
      '<rect x="33" y="303" width="452" height="29" rx="3" fill="#fff" opacity=".96"/>' +
      '<text x="42" y="323" font-size="13" fill="#1c3049">' +
        (isPeak ? "Geometric Bragg reinforcement" :
          "Selected angle: not an integer-order Bragg condition") +
      '</text>' +
    '</g>';
}

const pxy = (x, y) => fmt(x) + " " + fmt(y);
function drawPlot(points, measured, selectedAngle, peaks) {
  const x0 = 50, y0 = 20, w = 566, h = 207;
  const x = angle => x0 + (angle - SCAN_MIN_ANGLE) /
    (SCAN_MAX_ANGLE - SCAN_MIN_ANGLE) * w;
  const y = intensity => y0 + (1 - intensity) * h;
  const svg = ['<rect x="1" y="1" width="638" height="277" rx="7" fill="#fff"/>'];
  for (const level of [0, 0.5, 1]) {
    const py = y(level);
    svg.push('<path d="M' + pxy(x0, py) + 'H616" stroke="#d9e3ef" stroke-width="1"/>');
    svg.push('<text x="42" y="' + fmt(py + 4) + '" text-anchor="end" font-size="12" fill="#526981">' + fmt(level, 1) + '</text>');
  }
  for (const angle of [20, 60, 100, 140, 178]) {
    svg.push('<path d="M' + pxy(x(angle), 227) + 'v6" stroke="#70839a"/>');
    svg.push('<text x="' + fmt(x(angle)) +
      '" y="250" text-anchor="middle" font-size="12" fill="#526981">' + angle + '°</text>');
  }
  const curve = points.map((p, i) =>
    (i ? "L" : "M") + pxy(x(p.twoTheta), y(p.normalizedIntensity))
  ).join(" ");
  svg.push('<path d="' + curve + '" stroke="#084b9e" stroke-width="2.8" fill="none" stroke-linejoin="round"/>');
  for (const p of peaks) {
    const px = fmt(x(p.twoTheta));
    svg.push('<line x1="' + px + '" y1="20" x2="' + px +
      '" y2="227" stroke="#089e4b" stroke-width="1.5" stroke-dasharray="6 5" opacity=".75"/>');
    if (peaks.length <= 12) {
      svg.push('<text x="' + px +
        '" y="14" text-anchor="middle" font-size="11" fill="#167446">n=' + p.order + '</text>');
    }
  }
  const px = fmt(x(selectedAngle)), py = fmt(y(measured.normalizedIntensity));
  svg.push('<line x1="' + px + '" y1="20" x2="' + px +
    '" y2="227" stroke="#9e382e" stroke-width="1.8" stroke-dasharray="4 4"/>');
  svg.push('<circle cx="' + px + '" cy="' + py +
    '" r="5.5" fill="#9e382e" stroke="#fff" stroke-width="2"/>');
  svg.push('<text x="333" y="270" text-anchor="middle" font-size="13" fill="#1c3049">Detector angle · 2θ (°)</text>');
  svg.push('<text x="13" y="124" transform="rotate(-90 13 124)" text-anchor="middle" font-size="12" fill="#1c3049">Relative response</text>');
  el("scanIntensity").innerHTML = svg.join("");
}

function drawPhasors(result) {
  const els = ['<rect x="1" y="1" width="498" height="238" rx="7" fill="#f5f8fc"/>',
    '<text x="17" y="22" fill="#1c3049" font-size="13" font-weight="700">Equally spaced planes</text>'];
  for (let j = 0; j < result.planes; j++) {
    const y = 42 + j * 22;
    els.push('<line x1="17" y1="' + y +
      '" x2="148" y2="' + y + '" stroke="#91abc9" stroke-width="2"/>');
    els.push('<circle cx="116" cy="' + y + '" r="3.5" fill="#084b9e"/>');
  }
  els.push('<text x="17" y="235" font-size="11" fill="#5a708b">N = ' +
    result.planes + ' coherent contributions</text>');
  els.push('<path d="M166 22V218" stroke="#ccd9e8" stroke-width="1.5"/>');
  els.push('<text x="181" y="22" fill="#1c3049" font-size="13" font-weight="700">Complex phase vectors</text>');
  const originX = 296, originY = 122, length = 18.5;
  let x = originX, y = originY;
  els.push('<circle cx="' + x + '" cy="' + y + '" r="4" fill="#1c3049"/>');
  for (const p of result.phasors) {
    const nextX = x + length * p.real;
    const nextY = y - length * p.imag;
    els.push('<line x1="' + fmt(x) + '" y1="' + fmt(y) +
      '" x2="' + fmt(nextX) + '" y2="' + fmt(nextY) +
      '" stroke="#084b9e" stroke-width="3.2" stroke-linecap="round"/>');
    els.push('<circle cx="' + fmt(nextX) + '" cy="' +
      fmt(nextY) + '" r="2.3" fill="#084b9e"/>');
    x = nextX;
    y = nextY;
  }
  els.push('<line x1="' + originX + '" y1="' + originY +
    '" x2="' + fmt(x) + '" y2="' + fmt(y) +
    '" stroke="#9e382e" stroke-width="3.3" stroke-dasharray="7 4"/>');
  els.push('<circle cx="' + fmt(x) + '" cy="' + fmt(y) +
    '" r="4.5" fill="#9e382e"/>');
  el("scanPhasors").innerHTML = els.join("");
}

function render() {
  try {
    const { spacing, wavelength, guided } = conditions();
    const { peaks, totalOrders, truncated } = predictedBraggOrders({ spacing, wavelength });
    updateBraggChoices({ peaks, totalOrders, truncated });
    const chosen = peaks.find(p => p.order === selectedOrder);
    if (followPeak && chosen) {
      el("scanTwoTheta").value = fmt(chosen.twoTheta, 1);
    }
    const selectedAngle = num("scanTwoTheta");
    const result = finitePlaneInterference({
      spacing, wavelength, twoTheta: selectedAngle,
      planes: DEFAULT_PLANE_COUNT
    });
    const curve = finitePlaneScan({ spacing, wavelength, planes: DEFAULT_PLANE_COUNT });
    const isPeak = peaks.some(p => Math.abs(p.twoTheta - selectedAngle) < 0.11);
    drawRay(selectedAngle, spacing, isPeak);
    drawPlot(curve, result, selectedAngle, peaks);
    drawPhasors(result);
    el("scanTwoThetaValue").textContent = fmt(selectedAngle, 1) + "°";
    el("scanResponse").textContent =
      "Path difference between adjacent planes: Δ = " +
      fmt(result.pathDifference, 3) + " Å = " + fmt(result.cycles, 3) +
      "λ. The normalized " + DEFAULT_PLANE_COUNT + "-plane response is " +
      fmt(result.normalizedIntensity * 100, 1) +
      "% of its ideal coherent maximum." +
      (isPeak ? " The selected angle meets an integer-order Bragg condition." : "");
    el("scanContext").textContent = guided
      ? "d = " + fmt(spacing) + " Å, defined by the selected square-lattice plane family."
      : "d = " + fmt(spacing) + " Å, inferred from the advanced Bragg calculation.";
    el("scanError").textContent = "";
    el("scanPanels").hidden = false;
  } catch (error) {
    el("scanError").textContent = error.message;
    el("scanPanels").hidden = true;
    el("scanPeak").textContent = "";
    el("scanPeakSelect").disabled = true;
    el("scanSnap").disabled = true;
  }
}

el("scanTwoTheta").addEventListener("input", () => {
  followPeak = false;
  render();
});
el("scanPeakSelect").addEventListener("change", () => {
  selectedOrder = Number(el("scanPeakSelect").value);
  followPeak = true;
  render();
});
el("scanSnap").addEventListener("click", () => {
  if (!lastPeaks.length) return;
  const currentIndex = lastPeaks.findIndex(p => p.order === selectedOrder);
  selectedOrder = lastPeaks[(currentIndex + 1) % lastPeaks.length].order;
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
  selectedOrder = 1;
  render();
});
el("tryMeasuredPeak").addEventListener("click", () => {
  followPeak = true;
  selectedOrder = 1;
  render();
});
render();
