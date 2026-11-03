# Working on Frameworked

Read README.md, ROADMAP.md, and docs/PROJECT-MAP.md before changing architecture.
Read the nearest project AGENTS.md and MODEL.md before changing scientific calculations.

- Use the existing checkout. Do not create worktrees unless the user requests one.
- Website/content: layouts/, assets/, site-content/. Publication requires explicit approval.
- New standalone tools: projects/<project>/web is the source of truth.
- Run `python3 scripts/stage_tools.py` before Hugo preview/build. Generated static/tools/bragg,
  adsorption, and pore-accessibility folders are ignored; never edit or commit those copies.
- Existing Scherrer remains in static/tools/scherrer. PR #3 is a separate review; do not merge it
  or change its scientific methods as a side effect of work on the new tools.
- Keep scientific models, browser code, tests, assumptions, and data provenance together.
- No inferred experimental validation, invented crystal coordinates, or hidden unit assumptions.
- Run relevant project model tests with `node --test projects/<project>/tests/*.test.mjs`.
- For website integration, stage tools, build preview and production with Hugo 0.154.5,
  run scripts/verify_site.py and scripts/test_editorial.py, and check representative mobile/browser flows.
- Record meaningful work and remaining blockers in ROADMAP.md and the corresponding GitHub issue.
- GitHub Projects and new-repository creation were denied by the connection used for this sprint.
  Existing-repository issues/branches/PRs are the fallback; do not claim proposed repos exist.
- Future extraction: preserve project history, make standalone tests/preview work, and pin released
  versions in the website build. Avoid two independently editable copies of a tool.
