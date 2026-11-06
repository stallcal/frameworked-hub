# Frameworked workbench

The tools are for exploring scientific relationships. A visitor should be able to change a meaningful parameter, see its effect, and understand what the equation or model communicates.

- Show plots, results, and explanations immediately. Do not require a prediction or answer before the visitor can explore.
- Prefer a small set of physically meaningful parameters. Explain what is held fixed and when a control compares separate hypothetical systems.
- Connect each control to a visible consequence and a concise explanation. State quantities and units, not just “correct” or “incorrect.”
- Keep assumptions and sources available. Clearly separate measurements, interpolation, idealized models, and schematic geometry.
- Use the shared Frameworked typography, blue/brick-red palette, pale panels, and SVG arrows. Distinguish plotted series with line styles and labels as well as color.
- Keep controls, results, and math readable on mobile and with keyboard navigation. Respect reduced motion.

## Equations

Hugo pages render LaTeX at build time through `layouts/partials/equation.html`, which returns semantic MathML. Include `/css/math.css` on pages with equations. The self-hosted STIX Two Math font and its license live under `static/fonts/stix-two-math/`.

Standalone tools in `static/tools/` use equivalent native MathML. Use real fractions, radicals, subscripts, and superscripts instead of slash-separated text or simulated fractions. Equations must remain available without JavaScript or a third-party rendering service.

## Verification

Check the calculation relationships and limits, direct parameter updates, keyboard controls, and desktop/mobile layouts. Review rendered equations visually, including long fractions. Verify the Cloudflare preview before merging, then check the live deployment.
