import test from 'node:test';
import assert from 'node:assert/strict';
import { parseXY, findCandidates, findMarkerHit, hasCenterDrift, fitPeak, profileShape, scherrer, summarizeDomainSizes, syntheticPattern } from '../static/tools/scherrer/analysis.mjs';

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

test('marker hit-testing selects a visible marker only within a small 2D pixel radius', () => {
  const peaks = [{id:1, marker:{x:100,y:100}}, {id:2, marker:{x:140,y:100}}];
  const project = p => p.marker;
  assert.equal(findMarkerHit(peaks, 104, 102, project)?.id, 1);
  assert.equal(findMarkerHit(peaks, 139, 101, project)?.id, 2);
  assert.equal(findMarkerHit(peaks, 120, 100, project), null);
  assert.equal(findMarkerHit(peaks, 100, 130, project), null);
});

test('a neighboring stronger reflection cannot silently hijack the requested fitted center', () => {
  const data = Array.from({length:1701}, (_,i) => {
    const x = 5 + i*0.01;
    return {x, y:80 + 650*profileShape(x,8.45,0.09,0.25) + 590*profileShape(x,8.64,0.09,0.25)};
  });
  const fit = fitPeak(data, 8.64, 0.65, 'pseudo-voigt');
  assert.ok(fit);
  assert.equal(hasCenterDrift(fit,8.64), false);
  assert.equal(hasCenterDrift({center:8.64},8.64), false);
});

test('default automatic detection does not silently truncate 18 qualifying separated reflections', () => {
  const data = Array.from({length:1001}, (_, i) => {
    const x = 5 + i * 0.02;
    const intensity = Array.from({length:18}, (_, j) =>
      20 * profileShape(x, 6 + j * 0.9, 0.10, 0.15)
    ).reduce((a,b) => a+b,0);
    return {x, y:intensity};
  });
  const suggestions = findCandidates(data);
  assert.equal(suggestions.length, 18);
  assert.equal(findCandidates(data,14).length,14, 'Explicit caller cap must still be respected');
});

test('multi-reflection summary reports sample SD and SEM separately', () => {
  const summary = summarizeDomainSizes([40, 50, 60]);
  assert.equal(summary.n, 3);
  assert.equal(summary.mean, 50);
  assert.ok(Math.abs(summary.sd - 10) < 1e-9);
  assert.ok(Math.abs(summary.sem - 10 / Math.sqrt(3)) < 1e-9);
  assert.equal(summarizeDomainSizes([40]).sd, null);
  assert.equal(summarizeDomainSizes([]), null);
  assert.equal(summarizeDomainSizes([40, NaN]), null);
});

test('fitter holds identity near adjacent stronger reflection', () => {
  const points = Array.from({length: 1101}, (_, i) => {
    const x = 5 + i * 0.01;
    return {x, y: 7 + 450*profileShape(x, 8.60, 0.12, 0.3)
      + 800*profileShape(x, 8.97, 0.11, 0.3)};
  });
  const fit = fitPeak(points, 8.60, 0.23);
  assert.ok(fit && Math.abs(fit.center-8.60) < 0.06,
    `Fitted center should remain near requested peak, got ${fit?.center}`);
});
