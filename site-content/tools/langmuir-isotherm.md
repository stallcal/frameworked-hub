---
title: "Langmuir adsorption explorer"
description: "Change CO₂ adsorption affinity, saturation capacity, and pressure swing to see how uptake differs from ideal equilibrium working capacity."
layout: "gas-explorer"
topic: "MOFs & gas adsorption"
experiment: "langmuir"
icon: "langmuir"
equations:
  - "q(P)=q_{\\max}\\frac{KP}{1+KP}"
  - "\\Delta q=q(P_{\\mathrm{ads}})-q(P_{\\mathrm{regen}})"
  - "K_{\\mathrm{opt}}=\\frac{1}{\\sqrt{P_{\\mathrm{ads}}P_{\\mathrm{regen}}}}"
---

### What is a Langmuir isotherm?

A Langmuir isotherm is an **idealized mathematical model** for how equilibrium adsorption varies with pressure at a fixed temperature. Its familiar saturating shape is one possible example of a Type I-like adsorption curve. It is not a general description of all six IUPAC isotherm types.

- **P**, in bar, is the CO₂ partial pressure at the surface in this ideal single-component gas model.
- **q(P)**, in mmol/g, is equilibrium adsorbed amount per mass of adsorbent.
- **qmax**, in mmol/g, is the assumed maximum saturation capacity.
- **K**, in bar⁻¹, controls the pressure scale of adsorption. In this parameterization, the isotherm reaches half its saturation capacity when **P = 1/K**.

The model assumes equivalent adsorption sites with a finite capacity, single-component adsorbate, no lateral adsorbate interactions, equilibrium, and constant temperature. A real MOF may have different adsorption site energies, cooperative or flexible-framework behavior, competitive adsorption, and temperature-dependent affinity.

### Why working capacity can peak at intermediate affinity

In a hypothetical isothermal pressure-swing cycle, the adsorbent loads at a higher CO₂ partial pressure and unloads at a lower CO₂ partial pressure. **Equilibrium working capacity** is the difference between those two equilibrium uptake values, not the maximum uptake at one pressure.

At a fixed saturation capacity and two positive pressures, the ideal Langmuir model predicts its maximum difference at **K = 1/√(P_ads P_regen)**. This is a mathematical result for the chosen model, not an experimentally determined optimum for a real sorbent or separation process. When regeneration pressure is zero, there is no finite optimum in this simplified model.

For a representative *illustrative* pressure swing, try adsorption at 0.15 bar CO₂ and regeneration at 0.01 bar CO₂. A high affinity might give high capture uptake yet leave more gas retained at 0.01 bar.

**Evidence gap—assumption applied.** These are hypothetical model curves with chosen parameters, not measured MOF isotherms or validated flue-gas CO₂ working capacities. Real process performance also depends on CO₂/N₂/H₂O competition, kinetics, heat effects, regeneration method, bed packing, and cycle design. Regeneration by temperature swing cannot be represented by subtracting two uptake values on the same temperature isotherm.

### What makes this different from our other isotherm explorer?

[Adsorption isotherm shapes](/tools/isotherm-shapes/) illustrates and classifies broad curve families (Types I–VI), including hysteresis. This explorer tests **how one specific model's parameters affect quantitative uptake and an isothermal equilibrium pressure swing**. Both should be distinguished from the [experimentally based high-pressure methane storage tool](/tools/methane-storage/).

To see why 15% CO₂ in flue gas corresponds to approximately 0.15 bar CO₂ at 1 bar total pressure, try the [CO₂ partial pressure explorer](/tools/partial-pressure/).

### References

- [Langmuir adsorption isotherms: source overview and assumptions](https://doi.org/10.1021/acs.energyfuels.6c02221), *Energy & Fuels* (2026), review of adsorption-isotherm modeling for post-combustion CO₂ capture.
- Thommes et al., [Physisorption of gases, with special reference to the evaluation of surface area and pore size distribution](https://doi.org/10.1515/pac-2014-1117), *Pure and Applied Chemistry* (2015), IUPAC classification and interpretive limitations.
