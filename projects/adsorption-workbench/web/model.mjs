export const VERSION = "0.1.0";
export const R = 8.31446261815324; // kPa L mol−1 K−1
export const UNITS = {
  "mmol/g": "mmol/g",
  "mol/kg": "mol/kg",
  "mg/g": "mg/g",
  "g/g": "g/g",
  "cm3/g": "cm³ gas/g",
};
export const PRESSURES = {
  Pa: 1,
  kPa: 1000,
  MPa: 1e6,
  bar: 100000,
  atm: 101325,
  Torr: 101325 / 760,
};
const positive = (x) => Number.isFinite(x) && x > 0;
export function convertUptake({
  value,
  from,
  to,
  molarMass,
  temperature = 273.15,
  pressure = 101.325,
  basis = "unspecified",
}) {
  if (!Number.isFinite(value) || value < 0)
    throw Error("Uptake must be a finite, non-negative number.");
  if (!(from in UNITS) || !(to in UNITS))
    throw Error("Choose supported uptake units.");
  if (!["unspecified", "excess", "absolute"].includes(basis))
    throw Error("Choose a valid adsorption reporting basis.");
  const mass = [from, to].some((u) => ["mg/g", "g/g"].includes(u));
  const volume = [from, to].includes("cm3/g");
  if (mass && !positive(molarMass))
    throw Error(
      "A positive adsorbate molar mass is required for mass conversion.",
    );
  if (volume && (!positive(temperature) || !positive(pressure)))
    throw Error(
      "Reference temperature and absolute pressure must be positive.",
    );
  const factors = {
    "mmol/g": 1,
    "mol/kg": 1,
    "mg/g": molarMass,
    "g/g": molarMass / 1000,
    "cm3/g": (R * temperature) / pressure,
  };
  const canonical = value / factors[from],
    result = canonical * factors[to];
  if (!Number.isFinite(result) || !Number.isFinite(canonical))
    throw Error("Values exceed the supported numerical range.");
  return {
    value: result,
    canonical,
    from,
    to,
    input: value,
    basis,
    molarMass: mass ? molarMass : null,
    temperature: volume ? temperature : null,
    pressure: volume ? pressure : null,
    model: volume ? "Ideal gas, Z = 1" : "Dimensional conversion",
    normalization: "per gram of dry adsorbent (per kilogram for mol/kg)",
    version: VERSION,
  };
}
export function convertPressure(value, from, to) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    !(from in PRESSURES) ||
    !(to in PRESSURES)
  )
    throw Error("Use a non-negative pressure and supported units.");
  const result = (value * PRESSURES[from]) / PRESSURES[to];
  if (!Number.isFinite(result))
    throw Error("Values exceed the supported numerical range.");
  return result;
}
