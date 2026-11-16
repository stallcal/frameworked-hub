# Frameworked Workbench Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the public workbench, create a separate quantum explorer collection, fix confirmed homepage/navigation dead ends, and connect existing tools with meaningful next steps.

**Architecture:** Keep Hugo as the single source of routing and rendering. Add a small machine-readable tool grouping catalog, let workbench layouts render grouped cards via existing tool-link patterns, and use curated related links in shared templates and standalone static pages. Preserve canonical routes and draft-exclusion rules.

**Tech Stack:** Hugo 0.154.5 extended, Go templates, HTML/CSS, Node 22 built-in test runner, Python 3 validation.

**Spec:** `docs/superpowers/specs/2026-11-16-frameworked-workbench-navigation-design.md`

## Global Constraints

- Do not change scientific models or their input behavior; preserve all 17 existing tool URLs.
- Use `/tools/quantum/` only as a new collection page; do not relocate existing tool content.
- Header/mobile menu: Home, Tools, Explore, About; footer retains Articles.
- Homepage cards must not link to draft articles; Environment goes to `/explore/resources/?topic=pfas`.
- Maintain Frameworked's current typography, palette, responsive behavior, and footer commit reference.
- Protect unpublished content; build preview and production and run link verification before seeking preview approval.

## Review Focus

1. A direct visit or bookmark to any old quantum URL must still work: assert the full legacy route set in navigation tests and in built production output.
2. A homepage card linking to a workbench `#section` must scroll to a real target: verify exact IDs in built HTML with `scripts/verify_site.py`.
3. The resource-library query in the Environment card must preserve `topic=pfas` and lead to a published page: verify its path and current topic ID.
4. At 320–430px, the grouped listing and quantum collection must retain readable names and keyboard-focusable anchors: manually review preview and existing responsiveness tests.
5. Draft article links must never appear on public cards or related-tool panels: assert production HTML excludes draft paths.

---

### Task 1: Machine-readable grouping and tests

**Files:**
- Create: `data/workbench.json`
- Create: `tests/workbench-navigation.test.mjs`
- Modify: none initially

**Interfaces:**
- `data/workbench.json` exposes ordered `groups` with `id`, `title`, `description`, `tools` arrays and a `quantum` collection with the same tool-entry shape. Entries use canonical `url` and a Hugo page path or fallback metadata for static tools.
- The test reads this JSON with Node's built-in `JSON.parse`, checks unique exact routes, five declared group IDs, twelve primary routes, five quantum routes, and no overlap.

- [ ] Write a failing test for all 17 unique tool paths, the specified group membership, and the dedicated quantum collection.
- [ ] Run `node --test tests/workbench-navigation.test.mjs` and confirm expected RED because catalog is absent.
- [ ] Add `data/workbench.json` with approved group assignments. Resolve Hugo titles/descriptions from source content where possible and include fallback metadata only for standalone tools.
- [ ] Run the same test; confirm GREEN.
- [ ] Commit this self-contained data/test change.

### Task 2: Render grouped directory and quantum landing page

**Files:**
- Modify: `layouts/tools/list.html`, `assets/css/neo-sitewide-extensions.css`
- Create: `site-content/tools/quantum/_index.md`, `layouts/tools/quantum.html` (or Hugo's exact appropriate list template)
- Modify: `tests/workbench-navigation.test.mjs`

**Interfaces:**
- Consumes the grouping contract from Task 1 and existing `layouts/partials/tool-link.html`.
- Produces stable section anchors: `materials`, `adsorption`, `crystallography`, `spectroscopy`, `practical`.
- `/tools/quantum/` renders exactly the five secondary tools with an unobtrusive link back to `/tools/`.

- [ ] Extend test to require the five section IDs, one quantum collection link on the main page, and exclusion of quantum URLs from main card listings.
- [ ] Verify RED with `node --test tests/workbench-navigation.test.mjs`.
- [ ] Render categorized sections on `/tools/`, reusing card partials; add the quantum collection landing page. Scope any CSS to tool directory/secondary collection to avoid unrelated site changes.
- [ ] Build preview (`hugo --buildDrafts --environment preview --destination public --cleanDestinationDir`) and production (`hugo --environment production --destination public-production --cleanDestinationDir`); inspect generated links and anchors.
- [ ] Run the focused Node test; confirm GREEN, then commit.

### Task 3: Repair homepage and top navigation

**Files:**
- Modify: `layouts/index.html`, `layouts/_default/baseof.html`
- Modify: `tests/home-neo.test.mjs`, `tests/neo-sitewide.test.mjs`, `tests/footer-build-ref.test.mjs` only where old assumptions conflict

**Interfaces:**
- Uses anchor IDs from Task 2; keeps existing footer and published resource collection routes.
- Desktop/mobile headers have the same four primary links. Footer remains the stable access path for Articles.

- [ ] First update tests: header excludes `Articles` in main/mobile nav but retains it in footer; homepage cards point to the specified stable anchors and PFAS topic filter, never `/articles/pfas-groundwater/`.
- [ ] Run `node --test tests/home-neo.test.mjs tests/neo-sitewide.test.mjs tests/footer-build-ref.test.mjs` and confirm expected RED.
- [ ] Edit Hugo templates for the approved routes, header/footer distinction, and active-navigation states.
- [ ] Run focused tests and both Hugo builds, then run `python3 scripts/verify_site.py`; confirm GREEN.
- [ ] Commit this navigation fix separately.

### Task 4: Curated onward paths for every explorer

**Files:**
- Create: `data/tool_relations.json`, `layouts/partials/related-explorations.html`
- Modify: shared Hugo tool templates under `layouts/tools/` (`intro-explorer.html`, `mini-lab.html`, `mof.html`, `gas-explorer.html`, `vibration.html`, `normal-modes.html`) and `static/tools/{bragg,reagent-ratios,scherrer}/index.html`
- Modify: `tests/workbench-navigation.test.mjs`

**Interfaces:**
- `data/tool_relations.json` maps each of the seventeen canonical tool paths to one or two curated links with `url`, `title`, `description`. It may link to relevant published catalog topics; never drafts.
- The shared related-content partial retrieves links by `.RelPermalink`, renders accessible anchor text, and does not point from a tool to itself. Static pages get equivalent minimal HTML using the same curated mapping as source guidance.

- [ ] Extend tests to assert that every tool has one or two valid non-self next steps and no draft URL; verify RED before adding the manifest.
- [ ] Add the curated manifest and shared partial. Replace the indiscriminate related-mini-lab list with the curated links, and ensure quantum tools return to their secondary collection when appropriate.
- [ ] Add a compact onward-link block to the three standalone tool pages; preserve their existing JS and interactive layout.
- [ ] Run `node --test tests/workbench-navigation.test.mjs`, the full Node tests, and both Hugo builds plus `python3 scripts/verify_site.py`; confirm GREEN.
- [ ] Commit the crosslinks separately.

### Task 5: Release-quality review and preview handoff

**Files:**
- No code changes unless tests or review uncover a scoped issue.

**Interfaces:**
- The user reviews the branch preview. Production remains unchanged pending approval.

- [ ] Run `node --test tests/*.test.mjs` and record the total count and any failures.
- [ ] Run both Hugo builds, `python3 scripts/verify_site.py`, and `python3 scripts/test_editorial.py` with recorded exit codes.
- [ ] Verify generated production HTML has exactly the approved navigation structure, live PFAS resource link, five topic anchors, twelve primary cards, five quantum cards, and no leaked draft links.
- [ ] Inspect desktop, mobile (including 320/390/430px widths), focus states, and standalone tool footer/navigation via preview.
- [ ] Compare diff against pre-change branch, confirm no science-model files changed, and provide Caleb a preview link and commit ref; await his approval before merge/deployment.
