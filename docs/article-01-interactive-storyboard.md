# Interactive MOF Article 01 — editorial storyboard and science gate

**Status:** proposal for joint editorial and scientific review; **not approved for publication**.  
**Created:** 2026-11-12.  
**Canonical existing draft:** `site-content/articles/build-with-molecules/index.md` (still `draft: true`, `editorial_status: outline`).  
**Related preparation:** `docs/first-content-preparation.md`, `docs/article-01-review.md`; optional primer `site-content/learn/mof-definition/index.md`.  
**Existing interactive reference:** `/tools/node-and-linker/` and `layouts/partials/mof/node.html`.  

## Editorial decision to review

Keep **“What If We Could Build With Molecules?”** as the existing working narrative title; use **“What Is a Metal–Organic Framework?”** as the question readers answer. The final H1/SEO wording can be settled during the manuscript review. Avoid creating a second competing introductory article or overwriting the author's earlier manuscript. The current repository file is an outline, **not the author's finished script**.

**Reader:** curious high-school student through undergraduate chemistry; no prior MOF vocabulary presumed.  
**Learning outcome:** recognize the two kinds of building units; distinguish chemical structure from topological abstraction; recognize why a pictured void does not establish experimentally measured accessible porosity.  
**Narrative target:** roughly 400–650 words of main text, plus concise labels, captions, interaction prompts, and linked primary sources; let clarity win over a fixed count. Reusable as narration for a future video.

## Six-beat storyboard

| Beat | Reading question and editorial job | Illustration / reader action | What must remain explicit |
| --- | --- | --- | --- |
| **1 · A structure from pieces** | “What if the pieces of a building could be molecules?” Use beams-and-joints only as an entry point. | Original **conceptual** nodes and connectors, initially separated; button **Connect the pieces** reveals a small repeated network. | Chemical coordination and synthesis are not literal manual assembly. Label *schematic, not a specific MOF*. |
| **2 · What are the pieces?** | Introduce metal-containing units and organic ligands/linkers in plain language. A node may be a whole metal–oxygen cluster rather than one metal atom. | Interactive figure highlights **metal-containing unit** or **organic linker**, with text labels and separate non-color cues. | Do not imply every MOF is assembled from the same cluster or has the same connectivity. |
| **3 · Meet MOF-5** | Ground the abstraction in Li et al.'s 1999 MOF-5: Zn₄O-containing secondary building units and benzene-1,4-dicarboxylate (BDC) links. | Move from **schematic** to **MOF-5 representation** only after verifying the structural asset. Show ball-and-stick or polyhedral model and an aligned simplified **pcu** net. | Label the representation and data source. Zn₄O core geometry is *not* the same as the six-connected connectivity of the contracted SBU. |
| **4 · Why does the pattern repeat?** | Explain the idea of an extended periodic network, in one short paragraph. | Use **Show neighboring cells** to expand the view without changing connectivity; reset restores a readable default. | Do not describe one drawn cube automatically as the crystallographic unit cell. Verify the reduction used to assign the net. |
| **5 · Space versus evidence** | Introduce “potential voids” and why a drawing alone is not a measured adsorption result. | Highlight a cavity; pair the picture with an explicit **Evidence check**, not a fake animated adsorption process. | Accessible porosity and capacity need experimental conditions/data. Different MOFs may respond to activation and guest removal differently. |
| **6 · The question to carry forward** | Reader answers “Does a structure picture prove a gas-storage capacity?” then receives a short explanation and follows a source link. | Accessible two-option self-check, immediate explanation, original paper and IUPAC links; optional route to Article 02 when actually available. | State *No* without implying diagrams are scientifically useless. Do not surface links to unpublished pages. |

### Interaction 01: one modest reusable in-article module

A single visual module with these ordered states (not six unrelated tools):  
**A · Schematic pieces → B · Connected conceptual network → C · MOF-5 chemistry → D · Simplified connectivity net.**  
Use four clearly labeled buttons, plus optional highlight toggles (**metal unit / organic linker / void**). Provide an always-visible current-view caption, a concise “what changed” sentence, and a **Reset** control. Repeating units should remain traceable by the same visual anchors through each permitted state. The **MOF-5 chemistry state may not ship** until its coordinate provenance and reduction are approved; a labeled static MOF-5 reference image can serve as a temporary editorial placeholder.

- No numerical input, simulated adsorption capacity, predicted pore access, or unsupported synthetic outcomes in Article 01.
- Prefer reusing the existing node-and-linker rendering/data model after auditing its accuracy, selection accessibility and cell-boundary logic. Do not copy it verbatim into an unrelated article script.
- Architecture: reusable Hugo shortcode + scoped JS/CSS, following the existing `normal-mode` shortcode pattern. Maintain independent widget IDs if ever embedded more than once. Page content remains meaningful with JavaScript disabled.
- On mobile, keep controls adjacent to the figure. Avoid full-screen overlays, auto-rotation, forced scroll, tiny touch targets, and text placed inside an illegibly shrinking SVG. Support buttons/keyboard focus, non-color identification, alt/long descriptions, reduced motion, and a no-JS fallback.

## Scientific claim ledger: current basis and release gate

| Claim or distinction | Current support | Release gate |
| --- | --- | --- |
| MOF is a coordination network with organic ligands and **potential voids**; a crystal and measured permanent porosity are **not** definition requirements. | IUPAC 2013, DOI [10.1351/PAC-REC-12-11-20](https://doi.org/10.1351/PAC-REC-12-11-20); [Gold Book definition](https://goldbook.iupac.org/terms/view/12824). | Verify all final captions and prose use this qualified definition. |
| MOF-5 has the composition Zn₄O(BDC)₃, with Zn₄O-based nodes and BDC²⁻ linkers. | Li et al., *Nature* 402, 276–279 (1999), DOI [10.1038/46248](https://doi.org/10.1038/46248); crystallographic discussion in an [open-access article archived by PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC5571801/). | Audit formula, atom/linker depictions, guest/activation state and labels. |
| MOF-5 can be represented by a six-connected simple-cubic/**pcu** net under a stated SBU contraction. | Li et al. 1999, structural description; `docs/first-content-preparation.md`. | Independently confirm topology designation and the exact contraction used for the interactive model. Do not mistake tetrahedral Zn₄O atomic core for a four-connected topological node. |
| A molecular image can suggest cavities but does not **measure** sorption performance. | IUPAC 2013 and original MOF-5 diffraction/sorption evidence. | Identify which evidence is demonstrated by structural characterization versus adsorption measurements and quote conditions if metrics are introduced. |
| The current Frameworked node-and-linker viewer is described as using **calculated evacuated** MOF-5 coordinates. | `layouts/partials/mof/node.html` and a linked public CIF in that tool. | **Evidence gap—assumption applied.** Do not describe these coordinates as the original experimentally determined structure or treat a linked calculated CIF as fully audited crystallographic provenance. Verify its source, variant, coordinates, atom omissions, periodic bonds, reuse terms and relationship to the original work before embedding as authoritative. |

**No claims of general MOF durability, universal permanent porosity, commercially demonstrated capture performance, or guaranteed synthesis based on a diagram.** If any quantitative gas uptake, pressure, cavity size, temperature, surface area or formula-derived dimension is introduced, verify the original data, units, conditions and analysis method. The 1999 paper's reported Langmuir area estimate must not silently be relabeled BET.

## Source/rights and visual provenance checklist

- **Conceptual Figure A:** original SVG, with independently editable groups `metal-units`, `linkers`, `assembled-network`, `labels` and `assembly-arrow`. Caption says *conceptual illustration*. Use Frameworked navy/blue/red, plus shape and labels rather than color alone.
- **MOF-5 Figure B:** ideally source from reviewed crystallographic dataset with stable archive identifier and checksum; record experimental/calculated status, occupancy/guest state, software, cell replication, symmetry, hydrogen omissions, display settings and rights. Make a derived original rendering; do not reuse publisher figure art without verified license.
- **Available site asset:** `assets/images/mof-5.png` already has a Commons CC BY-SA 4.0 attribution recorded in `ASSET-CREDITS.md`. Check suitability; provide attribution if used. This image alone is not a verified interactive coordinate dataset.
- **Evidence panel:** rely on cited text and clearly identified historical experimental measurements rather than decorating the diagram with animated molecules implying an actual uptake simulation.
- Preserve explicit inline citations near supported claims and provide primary-source links via the existing Hugo reference mechanism.

## Publication and product acceptance tests

1. **Editorial:** confirm the author's manuscript, reading order, preferred headline and tone; no ghostwritten manuscript quietly replaces earlier work.
2. **Chemistry:** second pass checks every node, linker, connection, porosity statement and figure against source; unsupported parts remain labeled **Evidence gap—assumption applied.**
3. **Interaction:** state changes and reset remain deterministic; no misleading network mutation, missing atom labels or broken edge connectivity.
4. **Usability:** verify iPhone-sized viewport (320/390/430 px), tablet and desktop; readers can operate the article without hovering; keyboard focus and captions remain visible.
5. **No-JS/resilience:** static diagram and basic explanation are still usable; loading a widget does not block the prose, article contents or references.
6. **Performance:** lazy-load expensive visual assets, minimize duplicate scripts, avoid a heavyweight global 3D runtime for this first article.
7. **Release:** preview with drafts enabled and validate its content/citations; only after explicit joint editorial approval set `editorial_status: approved`, the actual publication date and `draft: false`. Confirm Cloudflare production separately.

## Decision points for the next review

1. **Headline:** keep `What If We Could Build With Molecules?` as H1 (existing manuscript direction) with MOF definition in the deck, or use the search-forward `What Is a Metal–Organic Framework?` as H1 and keep the narrative title as the opening.
2. **First interaction:** approve the four-state figure (conceptual pieces → connections → molecular MOF-5 → pcu net) or reduce to three states for tighter scope.
3. **Real-structure gate:** before the MOF-5 chemistry view goes live, choose an audited dataset or keep an attributed static structure image in the first preview.

**Next execution step, after this review:** build a **draft-only** Hugo shortcode prototype in an isolated branch, integrate it into the existing Article 01 outline, and test science + mobile behavior. Do not merge a published article until the narrative manuscript and scientific review are complete.
