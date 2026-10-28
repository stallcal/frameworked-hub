# Frameworked editorial redesign — review handoff

**Status:** Prepared for Caleb's review; do not merge into the production branch or publish without his approval.

**Branch:** `feat/editorial-redesign-scherrer`

## What changed

- A new homepage with Frameworked's blue/white/navy/graphite/green/oxide-red palette, Libron typography, and contrasting calligraphic italic accents.
- Original vector concept art and a clearly labeled illustrative PXRD plot. Neither represents experimental data or a specific crystallographic structure.
- Consistent navigation, reading-page typography, About treatment, and footer.
- A dedicated `/tools/` index and a static Scherrer Lab at `/tools/scherrer/` served by the existing Hugo/Netlify website.
- The calculator's imported scientific analysis core and interface, reusing Frameworked's existing Libron files and OFL license notices. No external font hosting or separate calculator domain is required.
- Explicit XYE support and a note that the third uncertainty column is not used in the fitting routine. Bruker BRML direct import is not implemented.

## Homepage refinement after Caleb's annotated review

- Adopted the blue + oxide-red contrast of the selected italic concept. The flowing display accents are oxide red on light backgrounds, with a lighter red tint for contrast on navy.
- Removed the prominent Scherrer Lab header button. The calculator remains discoverable through **Tools** and homepage calls to action.
- Replaced the word **journal** with the provisional eyebrow “MOFs / Materials Science / Research,” so Frameworked is not framed as a formal journal.
- Rephrased the hero description to call Frameworked a *place* to explore research and evidence.
- Made the diagram's nodes solid oxide red, removed the faint background grid, and added a dotted open-space marker within the conceptual network.
- Moved the “PORE / VOID” label into the right margin, reduced the distracting lower-right panel curve, and replaced the decorative slogan with a factual diagram caption.

These are review edits; the new eyebrow and hero description remain open for Caleb's approval.

### Tagline and scope decision

Caleb selected **“Exploring chemistry, one building block at a time.”** as Frameworked's working tagline. This replaces the older, more materials-specific footer line. The homepage eyebrow now uses it, and the About page distinguishes the site's current MOF research focus from the longer-term ambition to cover other chemistry fields and occasionally broader STEM subjects. The broadening is an aspiration, not a claim that those topics are already published.

## What has **not** changed

- Existing article drafts, editorial publication guards, source data, and URL structure.
- The production site's Netlify configuration, DNS, or hosting provider.
- Instrumental line-profile calibration or numerical fitting methodology: both remain a research beta pending experimental verification.

## Scientific review before public release

1. **Evidence gap—assumption applied.** The default wavelength 1.5406 Å assumes Cu Kα1. Verify the actual scan wavelength/optics, including possible Kα doublet treatment, before reporting a result.
2. **Evidence gap—assumption applied.** The default shape factor K = 0.90 is an estimate; the appropriate value depends on domain morphology and peak/profile conventions.
3. An instrumental broadening reference is unknown. Until measured on the same configuration, results are **uncorrected** and should not be represented as calibrated domain sizes.
4. Confirm fitting against measured XY/XYE patterns from Caleb's MOFs, with manually reviewed overlap, background, anisotropy, and noise. Synthetic tests and a textbook example are not experimental validation.
5. Direct `.brml` import should be scoped only after inspecting a representative BRML alongside its XYE export. Some BRML archives may contain multiple scans and instrument metadata.

## Build and quality checks

Use Hugo **0.154.5** (same as `netlify.toml`):

```sh
hugo --buildDrafts --environment preview --destination public --cleanDestinationDir
hugo --environment production --destination public-production --cleanDestinationDir
python3 scripts/verify_site.py
HUGO=hugo python3 scripts/test_editorial.py
node --test tests/scherrer-analysis.test.mjs
```

## Caleb's review checklist

- [ ] Homepage voice, page hierarchy, and Libron/italic pairing feel like Frameworked.
- [ ] Color balance and contrast reflect the existing brand, especially on mobile.
- [ ] Articles and About preserve accurate wording and editorial intent.
- [ ] Calculator appears integrated, not as a separate brand or host.
- [ ] Upload a real XYE file, inspect at least two clean peaks, and cross-check manual fits.
- [ ] Confirm scientific caveats and the instrument's wavelength before release.
- [ ] Decide whether the active Scherrer Lab should carry an explicit public **beta** label after launch.
- [ ] Approve a staged merge/deploy to Netlify only after review.

## Licensing

Libron is provided in `static/fonts/libron/` with `OFL.txt` and `COPYRIGHT.txt`, under SIL Open Font License 1.1. The calculator uses these **same local** font files through root-relative paths.
