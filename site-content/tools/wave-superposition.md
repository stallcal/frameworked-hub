{
  "title": "Wave superposition",
  "layout": "intro-explorer",
  "topic": "Quantum mechanics",
  "explorer": "superposition",
  "description": "Combine two quantum states and see how their relative phase reshapes probability.",
  "charttitle": "Two states, one wavefunction",
  "controls": [
    {
      "id": "weight",
      "label": "Probability weight in state 2",
      "min": 0,
      "max": 1,
      "step": 0.01,
      "value": 0.5
    },
    {
      "id": "phase",
      "label": "Relative phase / degrees",
      "min": 0,
      "max": 360,
      "step": 1,
      "value": 0
    }
  ],
  "equations": [
    "\\psi=\\sqrt{1-w}\\,\\phi_1+\\sqrt{w}\\,e^{i\\theta}\\phi_2",
    "\\phi_n(x)=\\sqrt{\\frac{2}{L}}\\sin\\!\\left(\\frac{n\\pi x}{L}\\right),\\qquad \\int_0^L|\\psi|^2dx=1"
  ]
}

The particle is confined to a one-dimensional infinite well of length L. The two basis states are orthonormal, so the square roots of the probability weights give a normalized combination. The green curve is probability density: its area, rather than its height at one point, determines probability.

This is a controllable snapshot, not a time animation. For a freely evolving superposition, relative phase evolves with the energy difference while the weights stay fixed. The well and its energies are fixed here. Real and imaginary components depend on phase convention; probability density is observable.

### Sources
[OpenStax: the quantum particle in a box](https://openstax.org/books/university-physics-volume-3/pages/7-4-the-quantum-particle-in-a-box) gives the stationary states. [Wave functions](https://openstax.org/books/university-physics-volume-3/pages/7-1-wave-functions) explains normalization and probability density.

Inspired by the extra-material topics in [UT Dallas CHEM 3322](https://personal.utdallas.edu/~son051000/chem3322.html).
