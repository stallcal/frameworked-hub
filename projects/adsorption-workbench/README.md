# Adsorption Workbench

**Purpose:** Research utility. **Version:** 0.1.0, review candidate.

Single-value uptake and pressure conversion, explicit reporting conditions and mass basis, and JSON calculation export.

## Run and test

Requires Node 20+ for tests and Python 3 for the local HTTP server. No npm dependencies or install step.

```sh
npm test
npm run dev
```

Run from this project directory. The development server uses port 8080; choose another port with
`python3 -m http.server 8081 --directory web` if it is occupied.
Deployable files are entirely in `web/`. Imports and assets are relative, so this directory can
be hosted on its own or mounted at `/tools/adsorption/` on Frameworked. Navigation links return to
Frameworked's website. No data are sent to a backend or external API.

## Science and verification

Read [MODEL.md](MODEL.md) for equations, conventions, numerical methods, and limitations.
Tests live in `tests/`. The tool runs entirely in the browser; exported JSON preserves the
relevant assumptions and tool version. Passing tests verifies these cases, not unrestricted
scientific validity. Perform browser/mobile review before a release.

## Repository status

This self-contained folder is temporarily in `stallcal/frameworked-hub` because the GitHub
connection denied creation of `stallcal/adsorption-workbench`. That separate repository is proposed,
not yet created. Read the website's `docs/PROJECT-MAP.md` for extraction and release integration.
Do not edit generated copies in the website's `static/tools/` directories.

## Next scope

Batch adsorption mass balance; CSV conversion after agreeing on a schema; uncertainty treatment.

## Licensing and assets

Original project code: MIT, see LICENSE. Libron v0.31 by Nico Verbruggen is bundled under
SIL OFL 1.1; preserve `web/assets/OFL.txt` and `COPYRIGHT.txt`. Font source:
https://github.com/nicoverbruggen/libron/releases/tag/v0.31 . No publication figures are copied.
