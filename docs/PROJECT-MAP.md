# Project map and agent handoff

Updated 2026-11-03. Read this alongside root AGENTS.md and ROADMAP.md. GitHub issue [#8](https://github.com/stallcal/frameworked-hub/issues/8) is the shared entry point.

## Where things belong

| Component | Source of truth now | Eventual repository | Website route |
| --- | --- | --- | --- |
| Website, articles, brand, catalog | frameworked-hub | Keep here | / |
| Bragg explorer | projects/diffraction-explorer/ | stallcal/diffraction-explorer (proposed) | /tools/bragg/ |
| Adsorption converter | projects/adsorption-workbench/ | stallcal/adsorption-workbench (proposed) | /tools/adsorption/ |
| Pore playground | projects/pore-accessibility-playground/ | stallcal/pore-accessibility-playground (proposed) | /tools/pore-accessibility/ |
| Existing Scherrer calculator | static/tools/scherrer/; tests/scherrer-analysis.test.mjs | Decide after PR #3 | /tools/scherrer/ |

The three proposed repositories do **not** yet exist. GitHub denied account-level repository and Project creation through this connection. Self-contained folders keep development moving without pretending the split happened. Issue [#7](https://github.com/stallcal/frameworked-hub/issues/7) records the migration checklist.

## Website and deployment

Hugo Extended 0.154.5 with custom layouts/CSS and the PaperMod submodule. `site-content/` is active; legacy `content/` is excluded. `netlify.toml` controls the production build and the connected main branch publishes to frameworked.org. Keep Netlify and the existing domain arrangement. These tools are ordinary static HTML/CSS/JavaScript; neither a backend nor a database/API key is required.

`data/tools.yaml` controls the new catalog entries, `layouts/tools/list.html` renders them, and `assets/css/editorial-redesign.css` styles the catalog. Other site sections remain separate. `projects/manifest.json` maps tool IDs, package directories and versions. `scripts/stage_tools.py` copies only the three named web directories into ignored `static/tools/` destinations. Netlify runs staging before Hugo. Scherrer is never a staging destination.

Edit the project source, then stage again. Never edit generated tool copies in static/ or public/. Each web/ folder is also independently deployable, with relative asset URLs and bundled licensed fonts. The stylesheet copies are intentionally owned by their individual projects; apply shared palette changes deliberately to all three until the future repository split.

## Inside each project

- README.md: purpose, standalone preview/tests, deployment and next scope.
- MODEL.md: equations/algorithm, units, assumptions, references and limitations.
- AGENTS.md: instructions for future agents changing this tool.
- web/model.mjs: pure scientific calculation, no DOM or network calls.
- web/app.mjs and index.html: interaction and presentation.
- web/style.css and assets/: brand styling and locally hosted fonts.
- tests/model.test.mjs: numerical examples, boundary cases and invariants.
- package.json, CHANGELOG.md, CITATION.cff and LICENSE: project identity/version and attribution. New project code uses MIT; bundled fonts retain their separate OFL notices. The root’s original license is unchanged.

## Working commands

Requires Node 20+ (CI uses 22), Python 3 and Hugo Extended 0.154.5. There are no npm dependencies to install.

```sh
# From repository root
python3 scripts/stage_tools.py
node --test projects/*/tests/*.test.mjs tests/scherrer-analysis.test.mjs
hugo server --buildDrafts --environment preview --bind 127.0.0.1 --port 1313
```

For one standalone project, change into its folder and run `npm test` or `npm run dev` (port 8080). The website README contains both build/verification commands. `.github/workflows/science-tools.yml` runs model tests and both publication modes on PRs and main pushes.

In the cloud workspace, use `export PATH=/workspace/.local/bin:$PATH` and `export HUGO_CACHEDIR=/workspace/.cache/hugo`. The writable cache avoids a Hugo WebP dispatcher crash encountered with the default cache during draft builds. Saved environment startup instructions must restart servers; processes do not persist into new tasks.

## GitHub organization

Keep one cross-repository Project named **Frameworked — Science Tools & Editorial** when permissions allow creation. Board columns: Backlog, Ready, In progress, Review, Done. Fields: purpose (Education, Research, Editorial, Infrastructure), component and priority. Views: All work, Education, Research tools, Editorial, Awaiting review.

For now, use ROADMAP.md and issues #4–#8. Labels `education`, `research-tool`, `science-review`, and `infrastructure` make the issue list filterable. A GitHub Project is an overview of existing issues/PRs, not another copy of source files or a replacement for README files.

When splitting repos, preserve each project’s commit history, migrate/link its issues, test it outside this checkout, and pin the release or commit consumed by the hub. Remove the old editable source only after the integration works and review approves the migration. Do not automatically deploy every upstream tool change to the production website.

## Existing editorial context

CREATING-CONTENT.md describes publication rules. docs/article-01-review.md tracks the introductory article. docs/brand-palette.md records the six-color palette. docs/topology-data.md records the future topology library. Earlier redesign handoffs are historical; check current main and open PRs before acting on old “pending” notes. PR #3 remains an independent Scherrer layout review, not part of this sprint.
