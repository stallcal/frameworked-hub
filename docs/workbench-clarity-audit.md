# Frameworked workbench — figure clarity audit

Reviewed: November 6, 2026
Scope: the 14 tools linked in the workbench directory, including Hugo pages and three standalone static calculators.
Method: repository source review of templates, scientific model code, SVG drawing code and associated text. **Not a completed visual/browser accessibility audit.** Confirm desktop/mobile rendering, keyboard support, plot readability, focus states, and scientific wording in Cloudflare preview before release.

| Tool | Primary scientific idea | Existing or improved cue | Follow-up |
| --- | --- | --- | --- |
| Adsorption isotherm shapes | Six schematic IUPAC families and hysteresis | This PR adds blue-solid/red-dashed legend and matching type-specific explanation cards and controls | Preview small-screen legend and overlapping or identical curves; distinguish adsorption from desorption paths |
| Franck–Condon spectra | Huang–Rhys factor changes strengths across discrete final vibrational levels | This PR labels the mean `⟨n⟩` and adds a legend for 0→0 vs 0→n | Confirm mobile plot and integer tick labels; avoid implying fractional individual states |
| Light through a solution | Beer–Lambert transmission versus concentration/path length | Existing incoming/outgoing beam plus calibration line; this PR explains the red current-setting marker | Check beam contrast and chart scaling at large absorbance |
| Methane storage lab | High-pressure CH₄ total uptake and deliverable capacity | Existing shaded pressure swing and endpoint markers; this PR adds matching swatch legends and table cues | Clearly retain 298 K, bar, STP/crystal-volume units and distinguish total from working uptake |
| Molecular vibration explorer | Isotope mass changes vibrational energy spacing | Existing HCl/DCl line styles and potential-energy curve; this PR adds an on-figure legend | Check long labels and isotope overlap on narrow screens |
| Node and linker explorer | Atomistic MOF-5 building units versus simplified network | Existing selection and structural highlighting; this PR gives the state-dependent legend actual colored swatches | Verify periodic neighboring groups, small-screen hit targets, and keyboard discoverability |
| Orbital mixing | Coupling splits and mixes two idealized basis states | Existing paired energy diagrams; this PR adds legends identifying basis orbitals and mixed-level energy order | Ensure users do not mistake colored final levels for pure orbitals |
| Particle in a box | Boundary conditions, nodes, and integrated density | Two directly labeled plots and shaded integration interval | Confirm fixed x/L scaling when changing physical width is understood |
| Pore access explorer | Guest diameter versus cavity/window diameters | Labeled cutaway and moving probe | Explain rigid schematic limit and avoid implying molecular diffusion barriers depend on size alone |
| Thermal populations | Boltzmann redistribution across a two-state model | State-population bars, red upper-state curve; this PR clarifies current-setting marker | Verify equal degeneracy assumption and marker visibility on phones |
| Wave superposition | Relative phase changes interference and probability density | Real/imaginary/density curves; this PR adds line-style/color legend | Verify density remains visually distinguishable for color-vision differences |
| Bragg’s law explorer | Lattice spacing and diffraction geometry | Lattice plane illustrations, numeric results, and explicit 2θ context | Full preview audit of mode switching, labels, and geometric constraints |
| Reagent ratio calculator | Molar ratios and mass/amount conversion | Input table and computed quantities with units; chart not needed | Audit error states, unit conversions, and responsive table layout |
| Scherrer calculator | Peak fitting, FWHM and crystallite size assumptions | PXRD curve/peak overlays, units and fit summary | Full UI audit for selection accuracy, background, instrument broadening and uncertainty handling |

## Review protocol for each release

1. Read the plot without opening long theory text; confirm the axes, units, legend, selection markers, and model status communicate the intended point.
2. Change every slider/select to its minimum, maximum, and a midrange value; verify text/graphics remain in sync and reset restores the original state.
3. Check responsive behavior at narrow mobile widths and ensure labels do not depend on color alone.
4. Validate any changed numerical model separately; this clarity pass deliberately does not alter model equations or experimental data.
5. Verify the Cloudflare preview and GitHub Actions checks before merge. The source review is *not* proof of browser or accessibility conformance.

## Backlog after this PR

- Consider stronger visual presentation of adsorption/desorption hysteresis direction, potentially directional arrows or an explicit branch key without crowding the plot.
- Improve keyboard discoverability of the MOF-5 atom selection interaction (the separate view buttons remain usable).
- Follow up on the Scherrer peak-selection concerns and an end-to-end audit of the standalone calculators.
- For new coordination chemistry, MOF architecture, topology, and breakthrough tools, apply the figure-first rubric before release.

## Mobile control-to-figure visibility
All introductory explorers, small labs, MOF-panel explorers, and the isotope vibration explorer now use a compact figure panel on narrow screens, with a sticky figure on portrait-height viewports (min-height 620px). The sticky panel remains bounded by its own visualization/controls container and releases before lower explanatory sections. On short or landscape viewports, the layout remains stacked without sticky behavior. Introductory plot-reading notes remain available in a collapsible disclosure, rather than consuming space while changing sliders.

**Visual QA still required:** verify actual Safari/iPhone behavior with the dynamic browser toolbar, first and last sliders, select dropdowns, rotation controls and reset behavior; check that the sticky figure never obscures focused inputs or cuts off plotted labels. Verify at widths 320/390/430px and shorter landscape heights.
