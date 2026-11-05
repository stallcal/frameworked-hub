const byId = id => document.getElementById(id);
const speedOfLight = 29979245800; // cm/s
const atomicMassUnit = 1.66053906892e-27; // kg
const planck = 6.62607015e-34; // J s
const chlorine = 34.968852682;
const isotopeMass = { H: 1.00782503223, D: 2.01410177812 };

const k = 480; // Shared model force constant in N/m for both isotopes.

function vibration(isotope) {
  const m = isotopeMass[isotope];
  const mu = m * chlorine / (m + chlorine);
  return { mu, band: Math.sqrt(k / (mu * atomicMassUnit)) / (2 * Math.PI * speedOfLight) };
}

function mark(group, tag, attrs, label) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  if (label !== undefined) el.textContent = label;
  group.append(el);
}

const px = pm => 267 + pm * 3.05;
const py = energy => 240 - energy * 222 / 15000;
const axes = byId('axes');
for (const energy of [0, 5000, 10000, 15000]) {
  const y = py(energy);
  mark(axes, 'line', { x1:84, x2:450, y1:y, y2:y, stroke:'#50627a' });
  mark(axes, 'text', { x:77, y:y+5, 'text-anchor':'end' }, String(energy));
}
for (const pm of [-60, -30, 0, 30, 60]) {
  mark(axes, 'text', { x:px(pm), y:264, 'text-anchor':'middle' }, String(pm));
}
let revealed = false;
function draw() {
  const isotope = revealed ? byId('isotope').value : 'H';
  const { mu, band } = vibration(isotope);
  byId('mass').value = mu.toFixed(3);
  byId('band').value = Math.round(band);
  byId('species').textContent = isotope === 'H' ? '¹H³⁵Cl' : '²H³⁵Cl';
  const scale = 0.5 * k * 1e-24 / (planck * speedOfLight); // V/hc per pm²
  const path = [];
  for (let pm = -60; pm <= 60; pm += 0.5) {
    path.push((pm === -60 ? 'M' : 'L') + px(pm) + ' ' + py(scale * pm * pm));
  }
  byId('potential').setAttribute('d', path.join(' '));
  const levels = byId('levels');
  levels.replaceChildren();
  for (let v = 0; v < 4; v++) {
    const energy = (v + 0.5) * band;
    const turningPoint = Math.sqrt(energy / scale);
    const y = py(energy);
    mark(levels, 'line', { x1:px(-turningPoint), x2:px(turningPoint), y1:y, y2:y, stroke:'#ffca85', 'stroke-width':2.4 });
    mark(levels, 'text', { x:px(turningPoint)+6, y:y+5 }, 'v = ' + v);
  }
  byId('well-desc').textContent = isotope + 'Cl at ' + k + ' newtons per meter. Adjacent levels are separated by ' + Math.round(band) + ' inverse centimeters.';
  if (revealed) {
    const h = vibration('H').band, d = vibration('D').band;
    byId('shift').textContent = 'The model predicts HCl at ' + Math.round(h) + ' cm⁻¹ and DCl at ' + Math.round(d) + ' cm⁻¹. The predicted shift is ' + ((1-d/h)*100).toFixed(1) + '% lower.';
  }
}
byId('predict').addEventListener('submit', event => {
  event.preventDefault();
  const correct = new FormData(event.currentTarget).get('guess') === 'lower';
  revealed = true;
  byId('predict').hidden = true;
  byId('comparison').hidden = false;
  byId('isotope').value = 'D';
  byId('feedback').textContent = (correct ? 'Correct. ' : 'The band shifts lower. ') + 'Switch between the two plots and compare the v = 0 to v = 1 gap. DCl’s larger reduced mass makes this gap smaller, so a lower-energy photon can excite the vibration.';
  draw();
  byId('isotope').focus();
});
byId('again').addEventListener('click', () => {
  revealed = false;
  byId('comparison').hidden = true;
  byId('predict').hidden = false;
  byId('predict').reset();
  draw();
  byId('predict').querySelector('input').focus();
});
byId('isotope').addEventListener('change', draw);
draw();
