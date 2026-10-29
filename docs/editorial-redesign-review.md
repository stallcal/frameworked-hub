# Frameworked editorial redesign — review handoff

**Status:** The initial redesign was deployed to Frameworked.org on October 28, 2026. A follow-up simplification is prepared for Caleb's review and has **not** been deployed.

**Current review branch:** `feat/scherrer-tool-simplify-pore`

## What changed

- A new homepage with Frameworked's blue/white/navy/graphite/green/oxide-red palette and Libron typography.
- Original vector concept art and a clearly labeled illustrative PXRD plot. Neither represents experimental data or a specific crystallographic structure.
- Consistent navigation, reading-page typography, About treatment, and footer.
- A dedicated `/tools/` index and a static Scherrer calculator at `/tools/scherrer/` served by the existing Hugo/Netlify website.
- The calculator's imported scientific analysis core and interface, reusing Frameworked's existing Libron files and OFL license notices. No external font hosting or separate calculator domain is required.
- Explicit XYE support and a note that the third uncertainty column is not used in the fitting routine. Bruker BRML direct import is not implemented.

## Homepage refinement after Caleb's annotated review

- Adopted the blue + oxide-red contrast of the selected italic concept. The flowing display accents are oxide red on light backgrounds, with a lighter red tint for contrast on navy.
- Removed the prominent Scherrer Lab header button. The calculator remains discoverable through **Tools** and homepage calls to action.
- Replaced the word **journal** with the provisional eyebrow “MOFs / Materials Science / Research,” so Frameworked is not framed as a formal journal.
- Rephrased the hero description to call Frameworked a *place* to explore research and evidence.
- Made the diagram's nodes solid oxide red, removed the faint background grid, and refined the conceptual network to emphasize its open channel.
- Kept the pore label to the right, reduced the distracting lower-right panel curve, and replaced the decorative slogan with a factual diagram caption.

These are review edits; the new eyebrow and hero description remain open for Caleb's approval.

### Follow-up: tool-first layout and editorial restraint (pending review)

- Removed the Scherrer page's large promotional hero, three teaching cards, history timeline, and sources section. The upload/fitting workspace is now the primary content; a compact equation and essential scientific caution remain next to the tool.
- Restyled the calculator using the main site's blue, oxide red, navy, pale paper, and Libron. Red is used sparingly as a visual accent; green retains a role for fit/status data.
- Replaced the small dashed pore marker with a stylized *open central channel*, shown through two linked hexagonal rings in perspective. This is a conceptual diagram, **not** a validated MOF topology.
- Replaced several decorative page slogans with explicit headings: “Scientific tools,” “Scherrer calculator,” and “Explore Frameworked.” Reduced italics to the main homepage expression.
- Removed the extra footer slogan and redundant homepage manifesto block. The chosen tagline remains once in the site's identity treatment.
- Set aside the science/history narrative for a future standalone article; see `docs/scherrer-article-backlog.md`.

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
- [x] Retain an explicit **research beta** label on the calculator.
- [ ] Review the new open-channel concept and simplified typography before merging the follow-up.

## Licensing

Libron is provided in `static/fonts/libron/` with `OFL.txt` and `COPYRIGHT.txt`, under SIL Open Font License 1.1. The calculator uses these **same local** font files through root-relative paths.
