import {
  PXRD_EXAMPLE_A, PXRD_EXAMPLE_LAMBDA,
  simpleCubicExamples, spacingFromTwoTheta
} from "./pxrd-model.mjs";

const el = id => document.getElementById(id);
const fixed = (v, digits=2) => Number(v).toFixed(digits);

// Geometric position markers only, deliberately not a diffraction
// intensity plot. All four marks are identical in length.
function drawCubicPositions() {
  const reflections = simpleCubicExamples();
  const left = 43, right = 577, minAngle = 10, maxAngle = 60, y = 119;
  const x = twoTheta =>
    left + ((twoTheta - minAngle) / (maxAngle - minAngle)) * (right - left);
  const elements = [
    '<rect x="1" y="1" width="618" height="194" rx="5" fill="#f7faff"/>',
    '<text x="26" y="26" fill="#1c3049" font-size="13" font-weight="700">Possible geometric reflection positions</text>',
    '<text x="593" y="26" fill="#637994" font-size="10.5" text-anchor="end">No intensities</text>',
    '<path d="M43 119H577" stroke="#6685a8" stroke-width="2"/>'
  ];
  for (const angle of [10, 20, 30, 40, 50, 60]) {
    const px = fixed(x(angle));
    elements.push(
      '<path d="M' + px + ' 119V127" stroke="#8094ad" stroke-width="1.5"/>',
      '<text x="' + px + '" y="148" fill="#566e89" font-size="12" text-anchor="middle">' + angle + '°</text>'
    );
  }
  reflections.forEach((reflection, index) => {
    if (reflection.twoTheta === null) return;
    const px = fixed(x(reflection.twoTheta));
    elements.push(
      '<path d="M' + px + ' 96V119" stroke="#084b9e" stroke-width="3.5" stroke-linecap="round"/>',
      '<circle cx="' + px + '" cy="119" r="5" fill="#084b9e" stroke="#fff" stroke-width="1.4"/>',
      '<text x="' + px + '" y="75" font-size="14" font-weight="700" text-anchor="middle" fill="#1c3049">' + reflection.label + '</text>',
      '<text x="' + px + '" y="91" font-size="11.5" text-anchor="middle" fill="#466486">' +
        fixed(reflection.twoTheta, 2) + '°</text>'
    );
  });
  elements.push('<text x="310" y="180" fill="#1c3049" font-size="12" text-anchor="middle">Scattering angle · 2θ (°)</text>');
  el("pxrdPositionChart").innerHTML = elements.join("");
  el("pxrdReflectionRows").innerHTML = reflections.map(p =>
    '<tr><th scope="row">' + p.label + '</th><td>' + fixed(p.d,3) +
    '</td><td>' + (p.twoTheta === null ? "Not accessible" : fixed(p.twoTheta,2)) +
    '</td></tr>'
  ).join("");
}

function convertMeasuredPeak() {
  const source = el("pxrdMeasuredAngle").value.trim();
  const angle = source === "" ? Number.NaN : Number(source);
  try {
    const d = spacingFromTwoTheta({
      twoTheta: angle, wavelength: PXRD_EXAMPLE_LAMBDA
    });
    el("pxrdConversionError").textContent = "";
    el("pxrdMeasuredSpacing").textContent = fixed(d, 2) + " Å";
    el("pxrdMeasuredEquation").textContent =
      "d = " + PXRD_EXAMPLE_LAMBDA + " Å / [2 sin(" +
      fixed(angle / 2, 3) + "°)]";
  } catch (error) {
    el("pxrdMeasuredSpacing").textContent = "—";
    el("pxrdMeasuredEquation").textContent = "";
    el("pxrdConversionError").textContent = error.message;
  }
}

drawCubicPositions();
convertMeasuredPeak();
el("pxrdMeasuredAngle").addEventListener("input", convertMeasuredPeak);
el("pxrdMeasuredAngle").addEventListener("change", convertMeasuredPeak);
