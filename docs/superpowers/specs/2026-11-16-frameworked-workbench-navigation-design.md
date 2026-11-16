# Frameworked Workbench Navigation — Design

Date: November 16, 2026
Status: approved direction; pending implementation-plan review

## Intent

Frameworked is an integrated science exploration platform rooted in chemistry and materials science. Its public workbench should be a curated entry point into scientific questions, not a flat list of unrelated demonstrations. Visitors should be able to discover a subject, use a relevant tool, and continue to a related resource without encountering draft pages or isolated destinations.

## Goals

- Make existing tools easier to browse by purpose, with clear subject headings and short descriptions.
- Give the five early quantum/wave models a secondary collection without deleting or changing their individual URLs.
- Eliminate the confirmed broken Environment homepage link and replace solitary homepage topic-card destinations with useful subject starting points.
- Temporarily remove Articles from desktop/mobile top navigation while the reading room has no published stories; retain Articles in the footer.
- Add curated onward links, in context, to existing tools and published resource collections.

## Non-goals

- No new scientific calculators, models, articles, topic hubs, or experimental results.
- No publication of drafts, deletion of pages, URL migration, redesign of the logo/typography/palette, or Cloudflare production deployment during preview review.
- Do not label existing simplified models inaccurate merely because their scope is limited. Franck–Condon remains an accessible, bounded displaced-harmonic-oscillator model, not a full spectroscopy lesson.

## Chosen approach and trade-offs

**Chosen: curated workbench + separate quantum collection.** The main `/tools/` page contains the strongest mission-relevant tools in meaningful sections. `/tools/quantum/` retains five earlier learning experiments. An unobtrusive link from the main workbench makes that collection discoverable without presenting it as equally developed coursework. Existing URLs continue to work.

**Alternative rejected: one categorized list of all seventeen tools.** Simpler to implement but would continue to present early quantum demonstrations beside deeper materials/science tools as if they were equivalent in maturity.

## Main workbench structure

1. `materials` — Materials & Frameworks: Node and Linker; Pore Access.
2. `adsorption` — Adsorption & Gases: Isotherm Shapes; Langmuir; CO₂ Partial Pressure; Methane Storage.
3. `crystallography` — Crystallography & Diffraction: Bragg; Scherrer.
4. `spectroscopy` — Spectroscopy & Measurement: Normal Modes; Molecular Vibration; Light Through a Solution.
5. `practical` — Practical Chemistry: Reagent Ratios.

Secondary `/tools/quantum/`: Franck–Condon; Orbital Mixing; Particle in a Box; Wave Superposition; Thermal Populations. Label this an exploratory, simplified-model collection. Maintain access to the five canonical individual pages and a route back to the main workbench.

## Navigation and discovery

- The header, including the mobile menu, shows Home / Tools / Explore / About. Articles remains in the footer, with its existing URL and draft guards intact.
- Homepage topic cards link to `/tools/#materials`, `/tools/#spectroscopy`, and `/tools/#practical`, except Environment & Sustainability, which links to the already-published `/explore/resources/?topic=pfas` catalog.
- Workbench section anchor IDs must be stable, accessible, and not obscured by the sticky site header.
- A concise related-content panel should guide each tool onward to relevant published tools or resource collections, never drafts. Connections must be meaningful: Bragg → Scherrer, Node and Linker → Pore Access, Isotherm Shapes → Langmuir, Normal Modes → Molecular Vibration, and corresponding reverse or adjacent links.
- Existing standalone static tools must remain listed and reachable. Their return links and contextual links should follow the same logic as Hugo tools.
- Main workbench should not re-list the five secondary quantum tools; a single clearly labeled route to the collection is sufficient.

## Constraints and acceptance

- Reuse existing Hugo templates and current Libron/neobrutalist CSS. Keep the established blue/navy/green/red palette.
- Preserve all seventeen public tool routes, the reading-room route, Library and Atlas, and the footer build reference. Do not change scientific calculations.
- Preview and production builds must exclude or include drafts appropriately. Check desktop/mobile, keyboard navigation, anchor accessibility, back links, and no broken internal links.
- Run the existing Node test suite and both Hugo builds plus site/editorial verification scripts. Update tests that intentionally encoded the former nav URLs rather than suppressing them.
- Do not merge or deploy production until Caleb has reviewed the preview.

## Evidence and remaining judgment

The Environment card currently resolves to a draft-only PFAS article and gives a production 404; the Articles page explicitly says publication is still in preparation. The tools listing is a flat alphabetical collection. These observations are source/URL checks, not a visual user study. **Evidence gap—assumption applied:** categorized exploration and related links should be clearer to first-time users; validate this with actual visitors later.

Implementation decisions left to the builder: restrained section styling and exact microcopy, best use of existing tool-link partial, and whether the crosslink metadata belongs in a small JSON manifest or page front matter. Do not expand scope into full topic hubs.
