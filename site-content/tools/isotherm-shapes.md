{
  "title": "Adsorption isotherm shapes",
  "layout": "intro-explorer",
  "topic": "Porous materials",
  "explorer": "isotherms",
  "description": "Compare six broad isotherm families and connect their shapes with possible adsorption processes.",
  "charttitle": "Shape is evidence, not a unique diagnosis",
  "controls": [
    {
      "id": "typea",
      "label": "Curve A",
      "options": [
        {
          "value": "I",
          "label": "Type I"
        },
        {
          "value": "II",
          "label": "Type II"
        },
        {
          "value": "III",
          "label": "Type III"
        },
        {
          "value": "IV",
          "label": "Type IV"
        },
        {
          "value": "V",
          "label": "Type V"
        },
        {
          "value": "VI",
          "label": "Type VI"
        }
      ]
    },
    {
      "id": "typeb",
      "label": "Curve B",
      "options": [
        {
          "value": "IV",
          "label": "Type IV"
        },
        {
          "value": "V",
          "label": "Type V"
        },
        {
          "value": "VI",
          "label": "Type VI"
        },
        {
          "value": "I",
          "label": "Type I"
        },
        {
          "value": "II",
          "label": "Type II"
        },
        {
          "value": "III",
          "label": "Type III"
        }
      ]
    },
    {
      "id": "pressure",
      "label": "Relative pressure p / p₀",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "value": 0.5
    }
  ],
  "equations": [
    "p_{\\mathrm{rel}}=\\frac{p}{p_0(T)}"
  ]
}

An isotherm records uptake as pressure changes at fixed temperature. Here p₀ is saturation vapor pressure at that temperature. Relative pressure is appropriate for a subcritical adsorptive, not every gas-storage experiment.

**These curves are illustrative drawings generated from shape functions, not measured data or adsorption-model fits.** Uptake is in arbitrary units. Heights do not compare capacities; the cursor is a reading aid. The endpoint at relative pressure 1 is illustrative, not a prediction at bulk saturation.

### What is adsorption hysteresis?

**Hysteresis means uptake follows different paths as pressure rises and falls.** During **adsorption**, gas pressure increases as the material fills. During **desorption**, pressure decreases as the material unloads; at the same pressure, some gas can remain adsorbed that was not present on the way up.

Our plot uses **color for the selected comparison** (blue = Curve A, red = Curve B) and **line style for the path** (solid = adsorption, dashed = desorption). For Type IV or V, the tinted region between the branches highlights hysteresis. A filled circle marks the loading-branch uptake at your chosen pressure; an open circle marks unloading-branch uptake.

Different paths can arise from metastability, capillary condensation in mesopores, pore blocking, or network effects. Flexible MOFs may also exhibit structural transitions. **A loop alone does not identify its physical mechanism.** This schematic does not predict experimental pore properties or hysteresis magnitudes.

### Reading the families
The descriptions above summarize six broad IUPAC families. Types I(a) and I(b) distinguish microporous shapes. IV(a) has hysteresis; IV(b) can be reversible. The plotted IV illustrates IV(a). Type IV(a) is hysteretic, while Type IV(b) can be reversible. Our Type IV illustration specifically represents IV(a); Type V also includes a loop in this simplified plot.

Classification describes morphology. Choosing a fitting equation such as Langmuir or BET requires appropriate assumptions and a valid pressure range. Shape alone does not determine pore size or identify a material.

### Why this matters for MOFs
Flexible MOFs can change structure as gas enters or leaves. Gate opening and structural transitions can create steps and hysteresis. A loop is not sufficient evidence for capillary condensation: structural measurements and experimental conditions matter. This explorer does not model framework flexibility or infer a mechanism from an unknown curve.

For measured high-pressure methane curves, explore [methane storage](/tools/methane-storage/).

### Literature
- Thommes et al. (2015), [Physisorption of gases — IUPAC Technical Report](https://doi.org/10.1515/pac-2014-1117). Classification, subtypes, and interpretation limits.
- [High-throughput gas separation by flexible metal–organic frameworks with fast gating and thermal management capabilities](https://www.nature.com/articles/s41467-020-17625-3), Nature Communications (2020). Experimental gate-opening behavior.
- [Temperature dependence of adsorption hysteresis in flexible metal organic frameworks](https://www.nature.com/articles/s42004-020-00429-3), Communications Chemistry (2020). Framework transitions, temperature, and hysteresis.
