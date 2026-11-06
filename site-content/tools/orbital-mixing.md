{
  "title": "Orbital mixing",
  "layout": "intro-explorer",
  "topic": "Quantum chemistry",
  "explorer": "mixing",
  "description": "Bring two orbital energies together and explore how coupling changes their energies and composition.",
  "charttitle": "From basis orbitals to mixed states",
  "controls": [
    {
      "id": "gap",
      "label": "Basis energy difference Δ / eV",
      "min": -4,
      "max": 4,
      "step": 0.1,
      "value": 2
    },
    {
      "id": "coupling",
      "label": "Coupling magnitude V / eV",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "value": 0.5
    }
  ],
  "equations": [
    "H=\\begin{pmatrix}0&V\\\\V&\\Delta\\end{pmatrix}",
    "E_\\pm=\\frac{\\Delta\\pm\\sqrt{\\Delta^2+4V^2}}{2}"
  ]
}

A and B are orthonormal basis orbitals with uncoupled energies 0 and Δ. The coupling V mixes them. Squared eigenvector coefficients give the composition percentages. At equal basis energies, any nonzero coupling produces equal mixing.

This is a two-state Hamiltonian, not a computed molecule. It neglects basis overlap, electron–electron interactions, orbital occupancy, and geometry changes. A lower eigenvalue alone does not establish molecular stability or bond order. Changing the sign of coupling changes relative eigenvector signs but not these energies or composition percentages.

### Sources
[Andrei Tokmakoff, Two-Level System](https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Time-Dependent_Quantum_Mechanics_and_Spectroscopy_2025e_%28Tokmakoff%29/02%3A_The_Schrodinger_Equation_and_Time-Propagator/2.03%3A_Two-Level_System) develops the coupled Hamiltonian and eigenstates.

Inspired by the extra-material topics in [UT Dallas CHEM 3322](https://personal.utdallas.edu/~son051000/chem3322.html).

