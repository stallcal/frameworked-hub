{
  "title": "Franck–Condon spectra",
  "layout": "intro-explorer",
  "topic": "Molecular spectroscopy",
  "explorer": "franck-condon",
  "description": "Change the displacement between electronic-state potentials and watch the vibrational progression redistribute.",
  "charttitle": "Vibrational overlap becomes spectral intensity",
  "controls": [
    {
      "id": "huang",
      "label": "Huang–Rhys factor S",
      "min": 0,
      "max": 6,
      "step": 0.05,
      "value": 1
    }
  ],
  "equations": [
    "P_n=|\\langle n_{\\mathrm{final}}|0_{\\mathrm{initial}}\\rangle|^2=e^{-S}\\frac{S^n}{n!}",
    "S=\\frac{\\mu\\omega(\\Delta Q)^2}{2\\hbar},\\qquad E_n=E_{00}+n\\hbar\\omega"
  ]
}

The starting vibrational state is v = 0. Both electronic states have harmonic potentials with the same frequency, but their equilibrium coordinates differ by ΔQ. The Huang–Rhys factor S measures displacement in natural oscillator units; μ is effective mass and ω is angular frequency. Increasing S increases the squared displacement at fixed mass and frequency.

Within the Condon approximation, the electronic transition dipole is independent of nuclear coordinate. Relative transition strengths then follow squared vibrational overlaps. They sum to one over all final vibrational states; the plot shows n = 0–20 and reports its included fraction.

This model omits hot bands, different frequencies, mode mixing, anharmonicity, and linewidths. Normalized strengths are not absolute experimental absorbances. E₀₀ is the energy of the 0 → 0 transition.

### Sources
[Andrei Tokmakoff, The Displaced Harmonic Oscillator Model](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Time-Dependent_Quantum_Mechanics_and_Spectroscopy_2025e_%28Tokmakoff%29/16%3A_Coupling_of_Electronic_and_Nuclear_Motion/16.01%3A_The_Displaced_Harmonic_Oscillator_Model) derives this progression and its assumptions.

Inspired by the extra-material topics in [UT Dallas CHEM 3322](https://personal.utdallas.edu/~son051000/chem3322.html).

