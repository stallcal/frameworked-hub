# Science tools v0.1 review

2026-11-03 · Review candidate, not an approved production release.

The sprint implements two educational models (Bragg geometry and 2D pore accessibility) and one research utility (adsorption unit conversion). See ROADMAP.md and issues #4–#8 for status. Each project’s MODEL.md is the authoritative description of its implemented assumptions.

## Validation performed

- 19 new numerical/model tests passed: Bragg 5, adsorption 6, pore accessibility 8.
- Existing 13 Scherrer analysis tests passed; Scherrer source was not modified.
- Hugo 0.154.5 preview and production builds passed using a writable cloud cache.
- Site checks passed: internal links/assets/anchors, one H1, draft exclusion in pages/feeds/sitemaps.
- All 5 editorial tests passed, including publication guards and series ordering.
- Chromium browser checks exercised the Tools catalog and all three tools at 320, 390, 768 and 1440 pixels without horizontal overflow. Input errors, reset behavior, calculation changes and JSON downloads passed; no JavaScript page errors.
- Mobile readouts stack to preserve legibility. The catalog’s existing Scherrer title was scaled at narrow widths to prevent overflow.

These checks establish agreement with implemented models and representative browser behavior. They do not establish experimental accuracy, independent scientific review, universal browser/accessibility conformance, or suitability for every research workflow.

## Review examples

**Bragg:** λ = 1 Å, d = 1 Å, n = 1 gives θ = 30°, 2θ = 60° and q = 2π Å⁻¹. nλ > 2d is rejected. Switch among d, 2θ and q to inspect the inverse calculations. Schematic plane separation is scaled for visibility; rays follow the calculated angle. Wavelength presets are rounded.

**Adsorption:** 1 mmol/g = 1 mol/kg. For CO₂ at M = 44.0095 g/mol it is 44.0095 mg/g. Reference volume is approximately 22.41397 cm³/g at 273.15 K and 101.325 kPa, or 22.71095 cm³/g at 273.15 K and 100 kPa. These are ideal-gas reporting volumes. Excess and absolute quantities are not interconverted; dry-adsorbent normalization is preserved.

**Pores:** the wide channel has a 20-unit opening. A small circular probe connects across it; radius 10 cannot pass without touching. The isolated pocket fits a small probe without an inlet connection. Conservative cell clearance may miss narrow continuous paths: compare grid resolutions, and retain “Not resolved” rather than claiming physical impossibility. Areas describe allowed probe centers in a 2D model, never material pore volumes.

## Remaining release review

Use the per-tool issue checklists for independent scientific review, wording, figures and approval. Check iOS/Safari and any relevant laboratory browser separately. There is no imported crystallographic structure, no instrument-data validation of these new models, and no research dataset sent to a server.

GitHub repository/Projects creation remains blocked by the connection’s account-level permissions; existing-repo issues provide the fallback. Main and existing draft PR #3 must remain separate from this review branch until the user approves release.
