# Frameworked

A local design foundation for frameworked.org: learning guides, research essays and videos, structure profiles, and an About & Research page.

## Preview

Use Hugo 0.154.5, matching the version pinned for Netlify in `netlify.toml`.
```powershell
hugo server --buildDrafts --environment preview --bind 127.0.0.1 --port 1313
```
Open http://localhost:1313/.

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
