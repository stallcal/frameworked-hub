# Frameworked

A local design foundation for frameworked.org: learning guides, research essays and videos, structure profiles, and an About & Research page.

## Preview

Use Hugo 0.154.5, matching the version pinned for Netlify in `netlify.toml`.
```powershell
hugo server --buildDrafts --environment preview --bind 127.0.0.1 --port 1313
```
Open http://localhost:1313/.

## Editorial redesign and Scherrer calculator (October 2026)

The first redesign was merged into `main` and published to frameworked.org on October 28, 2026. The Scherrer calculator lives at `/tools/scherrer/` within **the same** Netlify/Hugo deployment, without a second hosting provider. A subsequent tool-first layout, less slogan-heavy page hierarchy, and revised conceptual pore graphic are being reviewed on `feat/scherrer-tool-simplify-pore`; see [the review handoff](docs/editorial-redesign-review.md). The explanatory/history content is reserved for a separate [future article](docs/scherrer-article-backlog.md).

The calculator currently accepts XY/XYE text data (plus text, CSV, and DAT variants), fits individual peaks and reports exploratory Scherrer coherent-domain estimates. The third XYE uncertainty column is not used for weighting; direct BRML import is not yet supported. Until a measured line-profile standard is available, displayed sizes are uncorrected. Test the scientific routines with `node --test tests/scherrer-analysis.test.mjs`.

## Build and check
```powershell
hugo --buildDrafts --environment preview --destination public --cleanDestinationDir
hugo --environment production --destination public-production --cleanDestinationDir
python3 scripts/verify_site.py
python3 scripts/test_editorial.py
```
The checks verify internal links, assets, citation anchors, headings, alt attributes, draft exclusion, series reading order, published-only homepage sections, and editorial publication guards. Build destinations are generated output only.

## Writing and images
See [CREATING-CONTENT.md](CREATING-CONTENT.md) for templates, citations, related reading, and publishing guidance.
See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image licensing.

New content lives in site-content/. The original starter material remains in content/, excluded from this build.
Netlify serves frameworked.org. The production build is configured in netlify.toml and excludes drafts. Pushes to the connected production branch publish the site. Original unused static assets are preserved in archive/starter-static/ and are not deployed.

## Background
Built on the [Hugo academic website template](https://github.com/pmichaillat/hugo-website) with the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme retained as a submodule. The preview has custom layouts and styles. Original software licensing is retained in LICENSE.md; scientific images have their own licenses.

## First editorial sprint

The six-color palette is documented in `docs/brand-palette.md`. Series use stable IDs in `data/series.yaml`; empty collections are hidden. Article 01 is a draft outline, not the manuscript from the separate conversation. Its review checklist is in `docs/article-01-review.md`. The topology library remains a documented future step in `docs/topology-data.md`. Existing content, artwork, and PaperMod are preserved.
