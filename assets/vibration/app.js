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
  mark(axes, 'line', { x1:84, x2:450, y1:y, y2:y, stroke:'var(--hair)' });
  mark(axes, 'text', { x:77, y:y+5, 'text-anchor':'end' }, String(energy));
}
for (const pm of [-60, -30, 0, 30, 60]) {
  mark(axes, 'text', { x:px(pm), y:264, 'text-anchor':'middle' }, String(pm));
}
let revealed = false;
function draw() {
  const view = revealed ? byId('isotope').value : 'H';
  const isotopes = view === 'both' ? ['H','D'] : [view];
  const scale = 0.5 * k * 1e-24 / (planck * speedOfLight); // V/hc per pm²
  const path = [];
  for (let pm = -60; pm <= 60; pm += 0.5) {
    path.push((pm === -60 ? 'M' : 'L') + px(pm) + ' ' + py(scale * pm * pm));
  }
  byId('potential').setAttribute('d', path.join(' '));
  const levels = byId('levels');
  levels.replaceChildren();
  const results = byId('results');
  results.replaceChildren();
  const descriptions = [];
  for (const isotope of isotopes) {
    const { mu, band } = vibration(isotope);
    const hydrogen = isotope === 'H';
    const symbol = hydrogen ? '¹H³⁵Cl' : '²H³⁵Cl';
    const row = results.insertRow();
    row.className = hydrogen ? 'hcl' : 'dcl';
    for (const value of [symbol, Math.round(band), mu.toFixed(3)]) row.insertCell().textContent = value;
    descriptions.push(symbol + ': spacing ' + Math.round(band) + ' inverse centimeters');
    for (let v = 0; v < 4; v++) {
      const energy = (v + 0.5) * band;
      const turningPoint = Math.sqrt(energy / scale);
      const left = px(-turningPoint), right = px(turningPoint);
      const y = py(energy);
      // Use opposite halves of the symmetric well so nearby levels remain legible.
      const both = view === 'both';
      mark(levels, 'line', { x1:both && !hydrogen ? px(0) : left, x2:both && hydrogen ? px(0) : right, y1:y, y2:y, class:hydrogen ? 'hcl' : 'dcl' });
      const labelLeft = both && hydrogen;
      mark(levels, 'text', { x:labelLeft ? left-6 : right+6, y:y+5, 'text-anchor':labelLeft ? 'end' : 'start' }, 'v = ' + v);
    }
  }
  byId('well-desc').textContent = 'Shared harmonic potential at 480 newtons per meter. ' + descriptions.join('. ');

}
byId('predict').addEventListener('submit', event => {
  event.preventDefault();
  const correct = new FormData(event.currentTarget).get('guess') === 'lower';
  revealed = true;
  byId('predict').hidden = true;
  byId('comparison').hidden = false;
  byId('isotope').value = 'both';
  byId('outcome').classList.toggle('correct', correct);
  byId('feedback').textContent = correct ? 'Correct — DCl shifts lower.' : 'DCl shifts to a lower wavenumber.';
  const drop = 100 * (1 - vibration('D').band / vibration('H').band);
  byId('reason').textContent = 'Compare the gap from v = 0 to v = 1. With the same bond stiffness, DCl’s larger reduced mass brings the levels closer together. Its IR band is ' + drop.toFixed(1) + '% lower in wavenumber.';
  draw();
  byId('outcome').focus();
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
