# Future Frameworked article — what the Scherrer equation can tell us

The interactive calculator at `/tools/scherrer/` should remain a tool, with only the formula, required controls, numerical results, and essential scientific cautions. Reserve the explanatory and historical material for a separate, source-checked article.

## Proposed narrative

1. **The question:** Why can two crystalline samples have diffraction peaks of different widths? Distinguish finite coherent-domain effects from strain, instrument response, background, and overlapping reflections.
2. **The measurement:** Explain the full width at half maximum (FWHM) measured above the local background, with an original, labeled peak drawing.
3. **The equation:** `D = Kλ / (β cos θ)`; define wavelength, shape factor, Bragg angle (half of 2θ), β in radians, and the coherent-domain interpretation. Show the degree-to-radian conversion and the Å-to-nm conversion explicitly.
4. **What it cannot tell us:** Coherent-domain size is not necessarily particle size or particle diameter; discuss crystallite anisotropy, microstrain, instrument broadening, and limitations of one-peak estimates.
5. **Historical context:** Verify the Debye–Scherrer powder-method chronology and the original 1918 relation against primary historical sources before writing a historical account.
6. **MOF-specific perspective:** Explain how disorder, guest inclusion, anisotropic growth, and framework flexibility can complicate powder-peak interpretation, with material-specific literature rather than generalized assumptions.
7. **Worked example:** Use a sourced textbook example or a measured pattern cleared for publication, carefully labeling synthetic demonstrations.

## Source candidates to verify

- Gregory S. Girolami, *X-ray Crystallography*, section 41.3, pp. 444–446 (source already provided by Caleb).
- *International Tables for Crystallography*, volume H, domain-size and line-profile treatment: <https://onlinelibrary.wiley.com/iucr/itc/Ha/ch5o1v0001/>.
- NIST SRM 1979 line-profile standard documentation: <https://www.nist.gov/publications/certification-standard-reference-material-1979-powder-diffraction-line-profile-standard>.
- IUCr historical reminiscences by Paul Scherrer: <https://www.iucr.org/what-we-do/publications/books/Fifty-Years-of-X-ray-Diffraction/scherrer>.

These are research leads, **not yet a fully verified article bibliography**. Do not automatically import the old teaching-page copy into an article without source review and scientific editing.

## Scientific verification still outstanding

- **Evidence gap—assumption applied.** The calculator currently defaults to Cu Kα1 at 1.5406 Å and shape factor K = 0.90; confirm actual scan settings and appropriateness before reporting measurements.
- A measured instrument broadening standard from the same configuration is not yet available, so estimates are uncorrected unless the user supplies a separately calibrated approximation.
- Validate numerical fits against real MOF XY/XYE patterns and compare independent fitting software; synthetic tests alone are insufficient.
- Third-column XYE uncertainties are not used as fit weights, and direct BRML import is not implemented.
