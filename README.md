# Frameworked

A local design foundation for frameworked.org: learning guides, research essays and videos, structure profiles, and an About & Research page.

## Preview

Requires Hugo 0.147.2 or newer (tested with 0.154.5).
```powershell
hugo server --buildDrafts --environment preview --bind 127.0.0.1 --port 1313
```
Open http://localhost:1313/.

## Build and check
```powershell
hugo --buildDrafts --environment preview --destination public --cleanDestinationDir
hugo --environment production --destination public-production --cleanDestinationDir
python scripts/verify_site.py
```
The check verifies internal links, assets, citation anchors, headings, alt attributes, and exclusion of example drafts from production pages and feeds. Build destinations are generated output only.

## Writing and images
See [CREATING-CONTENT.md](CREATING-CONTENT.md) for templates, citations, related reading, and publishing guidance.
See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image licensing.

New content lives in site-content/. The original starter material remains in content/, excluded from this build.
Netlify serves frameworked.org. The production build is configured in netlify.toml and excludes drafts. Pushes to the connected production branch publish the site. Original unused static assets are preserved in archive/starter-static/ and are not deployed.

## Background
Built on the [Hugo academic website template](https://github.com/pmichaillat/hugo-website) with the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme retained as a submodule. The preview has custom layouts and styles. Original software licensing is retained in LICENSE.md; scientific images have their own licenses.
