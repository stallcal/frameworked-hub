# Image credits

- **Science Resources channel avatars (v0.1.3):** Optional YouTube channel profile thumbnails are resolved at page view time via the third-party `unavatar.io/youtube/<handle-or-channel-ID>` service, using the channel handle or ID already linked in the resource directory. This service is not part of Frameworked or YouTube; images are **not** hosted in this repository. Creator/channel owners retain rights to their profile images. Images are loaded lazily without a referrer and show initials if loading fails. Availability, matching accuracy, and external provider terms should be checked periodically before relying on the images as a durable brand element. Reference: https://unavatar.io/docs .
- **Active Frameworked logo:** `assets/images/frameworked-mark.png` (Hugo header and generated browser icons), `static/images/frameworked-mark.png` (standalone tool headers), and `static/images/frameworked-hero-png.png` (homepage) are verified PNG assets with actual alpha transparency, restoring the original transparent mark and avoiding the white square shown by the previous WebP. The superseded `frameworked-logo.webp` files are retained only as historical assets and are not used by these pages. The newly reattached file was provided to the runtime as a 1536 × 1536 JPEG without alpha despite its original PNG-based name; a transparent PNG derivative of that upload is separately available, but this patch selects the matching existing repository transparency assets to avoid unnecessary new binary commits. No SVG tracing was performed.
- `assets/images/frameworked-mark.png`, `static/images/frameworked-mark.png` and `static/favicon.ico`: November 11, 2026 update using the owner-supplied Frameworked geometric logo. The web copies are transparency-converted, resized/optimized derivatives of that image; the matching copies serve Hugo pages and standalone tools, and `favicon.ico` covers browser-tab fallbacks. No scientific diagram assets were modified.
- `assets/images/mof-5.png`: “MOF-5 Crystal Structure.png”, Axs154, 6 November 2025. Source: https://commons.wikimedia.org/wiki/File:MOF-5_Crystal_Structure.png . License: Creative Commons Attribution-ShareAlike 4.0, https://creativecommons.org/licenses/by-sa/4.0/ . Hugo resizes it and converts it to WebP for display; this derivative remains under CC BY-SA 4.0. Created by its author using CrystalMaker. Attribution, modification note, and license links appear wherever it is displayed.

The repository MIT license does not replace the separate image license.

## High-resolution logo activation

Upload the verified transparent 1024 × 1024 PNG as `assets/images/frameworked-logo-hd.png` and commit it to `main`. The Hugo site automatically uses this image for the homepage and derives the header PNG, favicon and Apple touch icon from it. The existing transparent assets remain fallbacks until the higher-resolution file is present. This image must have actual alpha transparency (RGBA or PNG `tRNS`), not an opaque white background.

## Typeface

Libron v0.31 by Nico Verbruggen, based on Readerly and Newsreader. Official unmodified Regular, Italic, Bold and BoldItalic WOFF2 files from https://github.com/nicoverbruggen/libron/releases/tag/v0.31 . Distributed under SIL Open Font License 1.1; license and copyright notices are included in static/fonts/libron/. Archive SHA-256: a1fcb64e6f49900491c5f9f5e1c589b0a757d6497aaff5117978783d7e70ed6b.

## Homepage halftone background
assets/images/hero-halftone.png is an AI-generated decorative red/cobalt print texture, generated for Frameworked on 2026-10-13. Hugo creates a WebP derivative. It is not a scientific illustration. The Frameworked logo is independently overlaid without AI redrawing; the current mark is the owner-supplied image described above.
