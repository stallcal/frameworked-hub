---
title: "CO₂ partial pressure explorer"
description: "Understand why 15% CO₂ in a gas mixture corresponds to 0.15 bar CO₂ at 1 bar total pressure, and explore concentration versus pressure."
layout: "gas-explorer"
topic: "Gas mixtures & carbon capture"
experiment: "partial-pressure"
equations:
  - "p_{\\mathrm{CO_2}} = y_{\\mathrm{CO_2}}P_{\\mathrm{total}}"
  - "y_{\\mathrm{CO_2}} = \\frac{\\mathrm{ppmv}_{\\mathrm{CO_2}}}{10^6}"
---

### Partial pressure is not total pressure

In a mixture of ideal gases, each component contributes a partial pressure equal to its mole fraction multiplied by the total **absolute** pressure. A 15% CO₂ mixture at 1 bar total pressure has a CO₂ partial pressure of 0.15 bar; it is not a mixture at 0.15 bar total pressure.

A mole fraction is dimensionless. Multiplying it by absolute pressure in bar produces a partial pressure in **bar**. Parts per million by volume (ppmv) is treated as a mole-fraction measure for an ideal gas mixture. Thus 420 ppm corresponds to 0.000420 mole fraction, or **0.042%**, and at 1 bar total yields **0.000420 bar CO₂**.

### Why this matters for MOFs

Gas adsorption is often discussed in terms of the **adsorbate's partial pressure**, particularly when interpreting selective uptake in a gas mixture. An equilibrium pure-component CO₂ isotherm measured at 0.15 bar is not itself a validated prediction of mixed-gas separation performance at 15% CO₂. Competitive adsorption, moisture, temperature, kinetics, and regeneration matter.

The illustrative flue-gas and air compositions are learning presets, not a characterization of any specific industrial stream or a time-stamped ambient air measurement. **Evidence gap—assumption applied.** The visualization treats the gas phase as ideal and does not account for nonideal fugacity or changes in composition.

### Related explorers

Compare [adsorption isotherm shapes](/tools/isotherm-shapes/) and measured [high-pressure methane storage data](/tools/methane-storage/). An idealized Langmuir adsorption model will provide the next connection between partial pressure, affinity and capacity.

### Reference

[OpenStax Chemistry 2e — Stoichiometry of Gaseous Substances, Mixtures, and Reactions](https://openstax.org/books/chemistry-2e/pages/9-3-stoichiometry-of-gaseous-substances-mixtures-and-reactions) explains gas mixtures and Dalton's law.
