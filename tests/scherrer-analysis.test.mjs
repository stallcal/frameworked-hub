import test from 'node:test';
import assert from 'node:assert/strict';
import { parseXY, findCandidates, fitPeak, profileShape, scherrer, syntheticPattern } from '../static/tools/scherrer/analysis.mjs';

test('parses XY with whitespace headers, and comma separators', () => {
  const rows = Array.from({length: 20}, (_,i) => `${i+5}, ${i*i}`).join('\n');
  const result = parseXY(`2theta intensity\n# comment\n${rows}`);
  assert.equal(result.length, 20);
  assert.deepEqual(result[0], {x:5,y:0});
});

test('parses XYE intensity and intentionally ignores the uncertainty column', () => {
  const rows = Array.from({length: 21}, (_,i) => `${(5 + i*.1).toFixed(2)} ${12 + i} ${Math.sqrt(12+i).toFixed(3)}`).join('\n');
  const data = parseXY(`# 2theta intensity sigma\n${rows}`);
  assert.equal(data.length, 21);
  assert.deepEqual(data[0], {x: 5, y: 12});
});

test('Scherrer calculation converts 2θ degrees/FWHM degrees and Å to nm', () => {
  const result = scherrer({ twoTheta: 10, fwhmDeg: 0.2 });
  assert.equal(result.valid, true);
  assert.ok(Math.abs(result.sizeNm - 39.88) < 0.1);
  assert.ok(Math.abs(result.betaRad - 0.0034906585) < 1e-8);
});

test('reproduces Girolami Chapter 41 worked ZrO2 example within rounding', () => {
  const result = scherrer({twoTheta:28.2, fwhmDeg:0.36, instrumentalFwhmDeg:0.16, correction:'gaussian', wavelengthA:1.540, shapeFactor:0.9});
  assert.equal(result.valid, true);
  assert.ok(Math.abs(result.sizeNm - 25.6) < 0.3);
});

test('rejects instrumental broadening greater than observed FWHM', () => {
  assert.equal(scherrer({twoTheta:10,fwhmDeg:0.1,instrumentalFwhmDeg:0.2,correction:'gaussian'}).valid, false);
});

test('pseudo-Voigt shape is half height at half the FWHM', () => {
  for (const eta of [0,0.5,1]) assert.ok(Math.abs(profileShape(10.2,10,0.4,eta) - 0.5) < 1e-12);
});

test('peak finder locates simulated reflections', () => {
  const peaks = findCandidates(syntheticPattern());
  assert.ok(peaks.some(p => Math.abs(p.x - 8.45) < 0.1));
  assert.ok(peaks.some(p => Math.abs(p.x - 17.38) < 0.1));
});

test('fits synthetic pseudo-Voigt peak with sensible FWHM and center', () => {
  const fit = fitPeak(syntheticPattern(), 8.45, 0.65, 'pseudo-voigt');
  assert.ok(fit);
  assert.ok(Math.abs(fit.center - 8.45) < 0.02, `center=${fit.center}`);
  assert.ok(Math.abs(fit.fwhmDeg - 0.27) < 0.04, `width=${fit.fwhmDeg}`);
  assert.ok(fit.rSquared > .95);
});
