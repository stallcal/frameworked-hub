/**
 * Frameworked PXRD Lab — pure, browser-independent scientific functions.
 * Input: 2θ in degrees, intensity in arbitrary units.
 * Output: FWHM in degrees of 2θ, Scherrer domain size in nm.
 */

export function parseXY(text) {
  const rows = [];
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/);
  for (const line of lines) {
    const clean = line.trim();
    if (!clean || /^[#;!%*]/.test(clean) || /^\s*<\?xml/.test(clean)) continue;
    const tokens = clean.split(/[\s,;]+/).filter(Boolean);
    if (tokens.length < 2) continue;
    const x = Number(tokens[0]);
    const y = Number(tokens[1]);
    if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 180) {
      rows.push({ x, y });
    }
  }
  if (rows.length < 15) {
    throw new Error('Could not find at least 15 two-column numeric data points. Upload an XY file with 2θ (degrees) and intensity.');
  }
  rows.sort((a, b) => a.x - b.x);
  const unique = [];
  for (const point of rows) {
    const last = unique[unique.length - 1];
    if (last && Math.abs(last.x - point.x) < 1e-9) {
      last.y = (last.y * last.count + point.y) / (last.count + 1);
      last.count += 1;
    } else unique.push({ ...point, count: 1 });
  }
  if (unique.length < 15 || unique.at(-1).x - unique[0].x < 0.1) {
    throw new Error('The scan must span at least 0.1° and have 15 distinct 2θ values.');
  }
  return unique.map(({ x, y }) => ({ x, y }));
}

const median = values => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function findCandidates(data, maxCount = 14) {
  if (data.length < 15) return [];
  const smoothed = data.map((p, i) => {
    let total = 0, weight = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(data.length - 1, i + 2); j++) {
      const w = 3 - Math.abs(i - j);
      total += data[j].y * w;
      weight += w;
    }
    return total / weight;
  });
  const sorted = [...smoothed].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.02)];
  const high = sorted[Math.floor(sorted.length * 0.99)];
  const range = Math.max(1e-12, high - low);
  const noise = median(smoothed.slice(1).map((v, i) => Math.abs(v - smoothed[i]))) * 1.4826;
  const threshold = Math.max(0.035 * range, 5 * noise);
  const dx = median(data.slice(1).map((p, i) => p.x - data[i].x));
  const radius = Math.max(8, Math.min(300, Math.round(1.3 / Math.max(dx, 0.001))));
  const possibles = [];
  for (let i = 3; i < data.length - 3; i++) {
    if (!(smoothed[i] >= smoothed[i - 1] && smoothed[i] > smoothed[i + 1])) continue;
    let left = smoothed[i], right = smoothed[i];
    for (let j = Math.max(0, i - radius); j < i; j++) left = Math.min(left, smoothed[j]);
    for (let j = i + 1; j <= Math.min(data.length - 1, i + radius); j++) right = Math.min(right, smoothed[j]);
    const prominence = smoothed[i] - Math.max(left, right);
    if (prominence > threshold) possibles.push({ index: i, x: data[i].x, prominence });
  }
  possibles.sort((a, b) => b.prominence - a.prominence);
  const selected = [];
  for (const peak of possibles) {
    if (selected.every(p => Math.abs(p.x - peak.x) >= Math.max(0.15, 5 * dx))) {
      selected.push(peak);
      if (selected.length >= maxCount) break;
    }
  }
  return selected.sort((a, b) => a.x - b.x);
}

function solve3(matrix, rhs) {
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  for (let col = 0; col < 3; col++) {
    let row = col;
    for (let i = col + 1; i < 3; i++) if (Math.abs(a[i][col]) > Math.abs(a[row][col])) row = i;
    if (Math.abs(a[row][col]) < 1e-14) return null;
    [a[col], a[row]] = [a[row], a[col]];
    const pivot = a[col][col];
    for (let j = col; j < 4; j++) a[col][j] /= pivot;
    for (let i = 0; i < 3; i++) {
      if (i === col) continue;
      const factor = a[i][col];
      for (let j = col; j < 4; j++) a[i][j] -= factor * a[col][j];
    }
  }
  return a.map(row => row[3]);
}

export function profileShape(x, center, fwhm, eta = 0) {
  const t = (x - center) / fwhm;
  const gaussian = Math.exp(-4 * Math.LN2 * t * t);
  const lorentzian = 1 / (1 + 4 * t * t);
  return (1 - eta) * gaussian + eta * lorentzian;
}

export function predictIntensity(x, fit) {
  return fit.intercept + fit.slope * (x - fit.center) + fit.amplitude * profileShape(x, fit.center, fit.fwhmDeg, fit.eta);
}

export function fitPeak(data, approximateCenter, halfWindowDeg = 0.65, model = 'pseudo-voigt') {
  const centerCandidate = Number(approximateCenter);
  if (!Number.isFinite(centerCandidate)) return null;
  const points = data.filter(p => Math.abs(p.x - centerCandidate) <= halfWindowDeg);
  if (points.length < 9) return null;
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const xStart = xs[0], xEnd = xs.at(-1);
  const dx = median(xs.slice(1).map((v, i) => v - xs[i]));
  const minWidth = Math.max(2 * dx, 0.0005);
  const maxWidth = Math.max(minWidth * 1.2, 1.8 * halfWindowDeg);
  let crest = 0;
  for (let i = 1; i < ys.length; i++) if (ys[i] > ys[crest]) crest = i;
  const center0 = xs[crest];
  const edgeN = Math.max(2, Math.floor(points.length * 0.12));
  const leftBase = median(ys.slice(0, edgeN));
  const rightBase = median(ys.slice(-edgeN));
  const baseline = (leftBase + rightBase) / 2;
  const peakHeight = ys[crest] - baseline;
  if (peakHeight <= 0) return null;

  const halfLevel = baseline + peakHeight / 2;
  let leftX = xStart, rightX = xEnd;
  for (let i = crest; i > 0; i--) {
    if (ys[i - 1] <= halfLevel) {
      const fraction = (halfLevel - ys[i - 1]) / Math.max(1e-15, ys[i] - ys[i - 1]);
      leftX = xs[i - 1] + fraction * (xs[i] - xs[i - 1]);
      break;
    }
  }
  for (let i = crest; i < xs.length - 1; i++) {
    if (ys[i + 1] <= halfLevel) {
      const fraction = (ys[i] - halfLevel) / Math.max(1e-15, ys[i] - ys[i + 1]);
      rightX = xs[i] + fraction * (xs[i + 1] - xs[i]);
      break;
    }
  }
  const width0 = Math.max(minWidth, Math.min(maxWidth, rightX - leftX));
  const minCenter = Math.max(xStart, centerCandidate - halfWindowDeg * 0.35);
  const maxCenter = Math.min(xEnd, centerCandidate + halfWindowDeg * 0.35);
  const fixedEta = model === 'gaussian' ? 0 : model === 'lorentzian' ? 1 : null;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const totalMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const sst = ys.reduce((a, y) => a + (y - totalMean) ** 2, 0);

  function evaluate(center, width, eta) {
    if (width < minWidth || width > maxWidth || center < minCenter || center > maxCenter || eta < 0 || eta > 1) return null;
    const matrix = [[0,0,0],[0,0,0],[0,0,0]];
    const rhs = [0,0,0];
    for (let i = 0; i < xs.length; i++) {
      const row = [1, xs[i] - center, profileShape(xs[i], center, width, eta)];
      for (let j = 0; j < 3; j++) {
        rhs[j] += row[j] * ys[i];
        for (let k = 0; k < 3; k++) matrix[j][k] += row[j] * row[k];
      }
    }
    const coeff = solve3(matrix, rhs);
    if (!coeff || coeff[2] <= 0) return null;
    let sse = 0;
    for (let i = 0; i < xs.length; i++) {
      const residual = ys[i] - (coeff[0] + coeff[1] * (xs[i] - center) + coeff[2] * profileShape(xs[i], center, width, eta));
      sse += residual * residual;
    }
    return { center, fwhmDeg: width, eta, intercept: coeff[0], slope: coeff[1], amplitude: coeff[2], sse };
  }

  let current = evaluate(clamp(center0, minCenter, maxCenter), width0, fixedEta ?? 0.5);
  if (!current) return null;
  let steps = [Math.max(dx, halfWindowDeg * 0.10), Math.max(dx, width0 * 0.25), 0.25];
  for (let iteration = 0; iteration < 70; iteration++) {
    let improved = false;
    for (let k = 0; k < (fixedEta === null ? 3 : 2); k++) {
      for (const direction of [-1, 1]) {
        const values = [current.center, current.fwhmDeg, current.eta];
        values[k] += direction * steps[k];
        const next = evaluate(values[0], values[1], values[2]);
        if (next && next.sse + 1e-12 < current.sse) {
          current = next;
          improved = true;
        }
      }
    }
    if (!improved) steps = steps.map(s => s * 0.53);
    if (steps[0] < dx * 0.0005 && steps[1] < dx * 0.0005) break;
  }
  const rSquared = sst > 0 ? 1 - current.sse / sst : 0;
  return {
    ...current,
    rSquared,
    points: points.length,
    startX: xStart,
    endX: xEnd,
    model,
    fitted: rSquared >= 0.7 && current.fwhmDeg > minWidth * 1.01 && current.fwhmDeg < maxWidth * 0.99
  };
}

export function scherrer({ twoTheta, fwhmDeg, wavelengthA = 1.5406, shapeFactor = 0.9, correction = 'none', instrumentalFwhmDeg = 0 }) {
  const valid = [twoTheta, fwhmDeg, wavelengthA, shapeFactor, instrumentalFwhmDeg].every(v => Number.isFinite(Number(v)));
  if (!valid || twoTheta <= 0 || twoTheta >= 180 || fwhmDeg <= 0 || wavelengthA <= 0 || shapeFactor <= 0 || instrumentalFwhmDeg < 0) {
    return { valid: false, error: 'Invalid peak angle, width, wavelength, shape factor, or instrumental width.' };
  }
  let sampleWidthDeg = fwhmDeg;
  if (correction === 'gaussian') sampleWidthDeg = Math.sqrt(fwhmDeg ** 2 - instrumentalFwhmDeg ** 2);
  if (correction === 'lorentzian') sampleWidthDeg = fwhmDeg - instrumentalFwhmDeg;
  if (!Number.isFinite(sampleWidthDeg) || sampleWidthDeg <= 0) {
    return { valid: false, error: 'Observed FWHM does not exceed the specified instrument width; size cannot be resolved.' };
  }
  const betaRad = sampleWidthDeg * Math.PI / 180;
  const thetaRad = (twoTheta / 2) * Math.PI / 180;
  const wavelengthNm = wavelengthA * 0.1;
  const sizeNm = shapeFactor * wavelengthNm / (betaRad * Math.cos(thetaRad));
  return { valid: true, sizeNm, thetaDeg: twoTheta / 2, observedWidthDeg: fwhmDeg, sampleWidthDeg, betaRad, wavelengthNm, correction };
}

export function syntheticPattern() {
  const data = [];
  for (let i = 0; i <= 1800; i++) {
    const x = 4 + i * 0.025;
    const base = 95 + 7 * Math.sin(x / 5) + 0.16 * x;
    const peaks = [[8.45, .27, 820], [12.6, .38, 530], [17.38, .31, 700], [24.2, .46, 280], [29.75, .41, 385], [37.5, .55, 230]];
    const signal = peaks.reduce((sum, [c, w, a]) => sum + a * profileShape(x, c, w, 0.35), 0);
    const noise = 6.2 * Math.sin(i * 2.17) + 3.3 * Math.cos(i * 0.73) + 2.5 * Math.sin(i * 1.31);
    data.push({ x, y: Math.max(0, base + signal + noise) });
  }
  return data;
}
