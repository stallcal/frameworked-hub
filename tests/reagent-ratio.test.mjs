import test from "node:test";
import assert from "node:assert/strict";
import { calculateRecipe, formatQuantity, formatRecipeText, positiveNumber, MAX_REAGENTS } from "../static/tools/reagent-ratios/model.mjs";

const pair = [
  { id: 1, name: "Zinc nitrate hexahydrate", molarMass: "297.49", equivalents: "1" },
  { id: 2, name: "H2BDC", molarMass: "166.13", equivalents: "2" }
];
const near = (actual, expected, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, String(actual) + " not close to " + expected);

test("100 mg zinc nitrate hexahydrate at 1:2 feed ratio calculates H2BDC", () => {
  const result = calculateRecipe(pair, 1, "100", "mg");
  assert.equal(result.ok, true);
  near(result.rows[0].massMg, 100);
  near(result.rows[0].mmol, 100 / 297.49);
  near(result.rows[1].mmol, 2 * 100 / 297.49);
  near(result.rows[1].massMg, (100 / 297.49) * 2 * 166.13);
});

test("switching known reagent preserves molar proportions", () => {
  const result = calculateRecipe(pair, 2, "100", "mg");
  assert.equal(result.ok, true);
  near(result.rows[1].massMg, 100);
  near(result.rows[0].mmol / result.rows[1].mmol, 0.5);
  near(result.rows[0].massMg, 100 / 166.13 / 2 * 297.49);
});

test("mass doubling doubles every mass and mmol, but preserves ratio", () => {
  const low = calculateRecipe(pair, 1, "100", "mg");
  const high = calculateRecipe(pair, 1, "200", "mg");
  for (let i = 0; i < pair.length; i++) {
    near(high.rows[i].massMg, 2 * low.rows[i].massMg);
    near(high.rows[i].mmol, 2 * low.rows[i].mmol);
  }
  assert.deepEqual(high.normalizedRatio, [1, 2]);
});

test("known units mg and g describe the same reference mass", () => {
  const mg = calculateRecipe(pair, 1, "100", "mg");
  const g = calculateRecipe(pair, 1, "0.100", "g");
  assert.deepEqual(g.rows, mg.rows);
});

test("known amount can be specified directly in mmol", () => {
  const r = calculateRecipe(pair, 1, "0.5", "mmol");
  assert.equal(r.ok, true);
  near(r.rows[0].mmol, 0.5);
  near(r.rows[0].massMg, 0.5 * 297.49);
  near(r.rows[1].mmol, 1);
  near(r.rows[1].massMg, 166.13);
});

test("three-reagent ratios use one common reference basis", () => {
  const three = [
    { id: 4, name: "A", molarMass: 50, equivalents: 2 },
    { id: 7, name: "B", molarMass: 80, equivalents: 3 },
    { id: 9, name: "C", molarMass: 100, equivalents: 5 }
  ];
  const r = calculateRecipe(three, 7, 60, "mg");
  assert.equal(r.ok, true);
  near(r.rows[1].mmol, 0.75);
  near(r.rows[0].mmol, 0.5);
  near(r.rows[2].mmol, 1.25);
  near(r.rows[0].massMg, 25);
  near(r.rows[2].massMg, 125);
  assert.deepEqual(r.normalizedRatio, [2 / 3, 1, 5 / 3]);
});

test("non-integer molar equivalents are supported", () => {
  const r = calculateRecipe([
    { id: "a", molarMass: 100, equivalents: 0.5 },
    { id: "b", molarMass: 100, equivalents: 1.5 }
  ], "a", 50);
  assert.equal(r.ok, true);
  near(r.rows[1].massMg, 150);
});

test("empty molar mass, zero, negative and nonnumeric values are rejected", () => {
  for (const bad of ["", " ", "0", "-2", "abc", "Infinity", "NaN"]) {
    const reagents = [{ ...pair[0], molarMass: bad }, pair[1]];
    assert.equal(calculateRecipe(reagents, 1, "100").ok, false, "Expected rejection for " + bad);
  }
});

test("nonpositive or missing molar equivalents are rejected", () => {
  for (const bad of ["", "-1", "0", "NaN"]) {
    assert.equal(calculateRecipe([{ ...pair[0], equivalents: bad }, pair[1]], 1, "100").ok, false);
  }
});

test("invalid and absent known masses are rejected", () => {
  for (const amount of ["", "0", "-1", "x", null, undefined]) {
    assert.equal(calculateRecipe(pair, 1, amount).ok, false);
  }
});

test("reject invalid reference IDs, duplicate IDs, invalid units and invalid reagent counts", () => {
  assert.equal(calculateRecipe(pair, 19, 100).ok, false);
  assert.equal(calculateRecipe(pair, 1, 100, "mL").ok, false);
  assert.equal(calculateRecipe(pair.map(r => ({ ...r, id: 1 })), 1, 100).ok, false);
  assert.equal(calculateRecipe(pair.slice(0, 1), 1, 100).ok, false);
  assert.equal(calculateRecipe(Array(MAX_REAGENTS + 1).fill(pair[0]), 1, 100).ok, false);
});

test("guard against overflow and invalid physical numerical magnitudes", () => {
  assert.equal(calculateRecipe(pair, 1, "1e309").ok, false);
  assert.equal(calculateRecipe(pair, 1, "1e308", "g").ok, false);
  const minuscule = calculateRecipe(pair, 1, "1e-9");
  assert.equal(minuscule.ok, true);
  assert.notEqual(formatQuantity(minuscule.rows[1].massMg), "0");
});

test("formatting avoids false zero for small quantities", () => {
  assert.equal(formatQuantity(0), "0");
  assert.equal(formatQuantity(0.000001), "1.0000e-6");
  assert.equal(formatQuantity(Infinity), "—");
  assert.equal(formatQuantity(111.686106), "111.69");
});

test("copied recipe text includes numbers, units and feed-ratio caveat", () => {
  const r = calculateRecipe(pair, 1, 100);
  const formatted = formatRecipeText(r);
  assert.match(formatted, /Molar FEED ratios/);
  assert.match(formatted, /H2BDC/);
  assert.match(formatted, /mg/);
  assert.match(formatted, /mmol/);
  assert.match(formatted, /hydrates, solvates and purity/);
});

test("positiveNumber treats whitespace as missing rather than zero", () => {
  assert.equal(positiveNumber(" "), null);
  assert.equal(positiveNumber("10"), 10);
});
