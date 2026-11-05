/**
 * Frameworked Reagent Ratio Calculator — pure, deterministic calculation core.
 *
 * Inputs: molar masses in g/mol, amount in mg or mmol, and user-selected
 * molar FEED equivalents (not balanced-reaction stoichiometric coefficients).
 * The numerical identity 1 g/mol = 1 mg/mmol makes n(mmol) = m(mg)/M(g/mol).
 *
 * No molecular formula parsing, chemical lookup, synthesis prediction,
 * limiting reagent analysis, or theoretical yields are implied.
 */
export const MAX_REAGENTS = 6;
export const MIN_REAGENTS = 2;

export function positiveNumber(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function calculateRecipe(reagents, referenceId, knownAmount, knownUnit = "mg") {
  if (!Array.isArray(reagents) || reagents.length < MIN_REAGENTS || reagents.length > MAX_REAGENTS)
    return { ok: false, error: "Enter between two and six reagents." };

  if (!["mg", "g", "mmol"].includes(knownUnit))
    return { ok: false, error: "Select a supported amount unit." };

  const identifiers = reagents.map((r) => String(r.id));
  if (new Set(identifiers).size !== identifiers.length)
    return { ok: false, error: "Each reagent must have a unique identifier." };

  const basisIndex = identifiers.indexOf(String(referenceId));
  if (basisIndex < 0)
    return { ok: false, error: "Select a reagent to use as the known amount." };

  const parsed = [];
  for (let i = 0; i < reagents.length; i += 1) {
    const reagent = reagents[i];
    const molarMass = positiveNumber(reagent.molarMass);
    const equivalents = positiveNumber(reagent.equivalents);
    if (molarMass === null)
      return { ok: false, error: "Enter a positive molar mass for Reagent " + (i + 1) + "." };
    if (equivalents === null)
      return { ok: false, error: "Enter positive molar equivalents for Reagent " + (i + 1) + "." };
    parsed.push({ id: reagent.id, name: String(reagent.name || "").trim(), molarMass, equivalents });
  }

  const quantity = positiveNumber(knownAmount);
  if (quantity === null)
    return { ok: false, error: "Enter a positive known amount." };

  const reference = parsed[basisIndex];
  const knownMmol = knownUnit === "mmol" ? quantity :
    knownUnit === "g" ? quantity * 1000 / reference.molarMass :
    quantity / reference.molarMass;

  if (!Number.isFinite(knownMmol) || knownMmol <= 0)
    return { ok: false, error: "Known amount is outside the numerical range." };

  const rows = parsed.map((reagent, i) => {
    const mmol = knownMmol * (reagent.equivalents / reference.equivalents);
    const massMg = mmol * reagent.molarMass;
    return { ...reagent, index: i, isReference: i === basisIndex, mmol, massMg, massG: massMg / 1000 };
  });
  if (rows.some((r) => !Number.isFinite(r.mmol) || !Number.isFinite(r.massMg) ||
     r.mmol <= 0 || r.massMg <= 0 || !Number.isFinite(r.massG) || r.massG <= 0))
    return { ok: false, error: "Calculated amount exceeds the supported numerical range." };

  return {
    ok: true,
    rows,
    knownAmount: quantity,
    knownUnit,
    referenceId,
    normalizedRatio: parsed.map((r) => r.equivalents / reference.equivalents)
  };
}

/** Five significant figures, switching to scientific notation for very small
 *  quantities rather than misleadingly displaying 0.00 mg. */
export function formatQuantity(value) {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const absolute = Math.abs(value);
  if (absolute < 0.001 || absolute >= 1e7) return value.toExponential(4);
  const rounded = Number(value.toPrecision(5));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 9 });
}

export function formatRecipeText(recipe) {
  if (!recipe || !recipe.ok) return "";
  const lines = [
    "Frameworked — Reagent Ratio Calculator",
    "Molar FEED ratios (not balanced reaction stoichiometry)",
    "Known basis: " + recipe.knownAmount + " " + recipe.knownUnit,
    ""
  ];
  for (const row of recipe.rows) {
    lines.push((row.name || "Reagent " + (row.index + 1)) +
      " | M = " + formatQuantity(row.molarMass) + " g/mol" +
      " | equivalent = " + formatQuantity(row.equivalents) +
      " | n = " + formatQuantity(row.mmol) + " mmol" +
      " | mass = " + formatQuantity(row.massMg) + " mg" +
      (row.isReference ? " [known basis]" : ""));
  }
  lines.push("", "Amounts assume pure reagents and user-entered molecular forms; verify hydrates, solvates and purity.");
  return lines.join("\n");
}
