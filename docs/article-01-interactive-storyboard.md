# Interactive MOF Article 01 — editorial storyboard and science gate

> **Current figure (November 13, 2026):** Preserve this five-section narrative arc, but supersede the earlier slider/SVG references below. The Figure 1 implementation is now the rotatable 3D conceptual viewer in [draft PR #64](https://github.com/stallcal/frameworked-hub/pull/64) with four direct stage choices, a solid illustrative potential-void sphere and camera focus. The website remains unpublished. A later experimental MOF-5 rendering must be distinguished from the existing calculated PBEsol source and separately verified.


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

## Revised article outline: five distinct sections

**One governing thought:** “Chemists can link metal-containing units and organic molecules into repeating structures. The space in those structures is interesting—but what it can actually do is a separate experimental question.” Place the point early. This follows the CDC [Clear Communication Index](https://www.cdc.gov/ccindex/) guidance to organize around one main message and to let visuals reinforce rather than duplicate words.

**Recommended working H1:** *What If We Could Build With Molecules?*  
**Search-forward subtitle/deck:** *How metal-containing units and organic linkers create metal–organic frameworks—and what the open space does (and doesn't) tell us.*  
The final title and draft prose remain subject to the author's approval. Retain one introductory article rather than publishing two nearly identical “What is a MOF?” pieces.

| Section / reader question | The section's **only** new job | Visual cue and interaction | Deliberately leave out |
| --- | --- | --- | --- |
| **1 · What if we could build with molecules?** | A short, specific hook: what changes when you connect small building units into a material? Briefly introduce the central question, not a glossary. | One teaser frame of the separate building blocks; no full lesson in the intro. | Repeating the definition, premature gas-storage applications, or a long construction analogy. |
| **2 · What are the pieces?** | Introduce a metal-containing building unit and an organic linker. Say what each does, then name the language of *nodes* and *links* in a simplified model. | **Slider 0**: identify each labeled piece. | Re-explaining the opening hook or confusing a node with one atom in every MOF. |
| **3 · How does one connection become a framework?** | Explain repetition in three dimensions and meet **MOF-5** as a specific example with Zn₄O-containing units and BDC linkers. State that a simplified net is not an atom-by-atom structure. | **Slider 1→2→3:** conceptual **1×1×1 → 2×2×2 → 3×3×3 repeating blocks**. Optional actual MOF-5 chemistry mode only after its dataset and representation are verified. | A second separate “building blocks” explanation, a topology taxonomy, numerical capacities, or calling the schematic cube an experimental unit cell. |
| **4 · What's inside the structure?** | Direct attention to the *potential void*. Explain briefly why the visible cavity matters and what the representation cannot tell us. | **Show a pore**: one small sphere marks a possible void in the conceptual scene, labeled *illustrative, not to scale*. | Implied guest diffusion, a fabricated pore diameter, or claiming gas uptake from a drawing. |
| **5 · What would prove it?** | Give the reader the scientific habit: structural evidence describes the arrangement; adsorption/other measurements under stated conditions test material behavior. End with a self-check and primary sources. | Short **Does a visible hole prove storage capacity?** answer/explanation, with cited MOF-5 and IUPAC sources. | Another definition, a full isotherm tutorial, broad application claims, or an empty next-article teaser. |

**Pacing target:** roughly 450–650 words of main prose, excluding figure UI, compact captions and references. Aim for 1–3 short paragraphs per section, not five mini-textbook chapters. Each sentence should add new information, give an example, advance the reader's question, or connect a claim to evidence. If the slider already shows a relationship, the text should explain its *meaning* rather than narrate every motion.

### Main illustration (single source of truth)

See **[Article 01 interactive figure specification](article-01-interactive-figure-spec.md)**. It supersedes the earlier button-driven four-view concept. The core control is now **one discrete scale slider** with stages **pieces → 1³ → 2³ → 3³**, supported by a **Show a pore** overlay. A separate **schematic/verified-chemistry** representation switch is deferred until MOF-5 structure-data provenance passes review. Do not present the conceptual 1³ block as an experimentally verified crystallographic cell.

The pore sphere marks **potential void space** only—not a measured diameter, guest molecule, or accessibility calculation. If a quantitative comparison is introduced later, distinguish cavity from window, radius from diameter, and model geometry from experimental uptake.

### Writing and science communication checklist

Use [CDC Clear Communication Index](https://www.cdc.gov/ccindex/) and [NIH plain-language guidance](https://www.nih.gov/institutes-nih/nih-office-director/office-communications-public-liaison/clear-communication/plain-language-nih) as review aids, not as an excuse to oversimplify chemistry.

- **Begin with a meaningful visual question**, then promptly deliver an actual idea. Avoid three rhetorical questions in a row, hype like “magical sponges,” and “imagine a world where…” filler.
- **Define each term once, exactly when needed:** building unit, linker, coordination network, MOF, potential void, and (only if essential) crystallographic unit cell. Do not introduce pcu as an unexplained acronym in the main body; reserve its formal meaning for a caption, tooltip or optional deep dive.
- **Use active, concrete verbs** (“connect,” “repeat,” “occupy,” “measure”); vary sentence lengths. Explain real chemistry without sounding like a lab report or pretending bonds are literal hand-built beams.
- **Put captions beside the relevant visual.** A sentence that says only “Here, we can see the nodes and linkers…” belongs in a label or should be removed.
- **Separate observed facts, conceptual models and open questions** in wording. Describe MOF-5's sourced structural units accurately; withhold quantitative porosity claims until measured methods and conditions are cited.
- **Use one purposeful check for understanding**, not a quiz after every scroll. Readers should be able to say what the model illustrates *and* what it cannot establish.
- **Test with a non-specialist reader** after scientific review: ask what they think the sphere means and whether they understand the distinction between a schematic and crystallographic data. Revise wherever those answers drift.

### Tone probe — not final manuscript copy

> Most materials are easiest to describe once they're finished. Metal–organic frameworks invite a different question: what if we looked closely at the pieces, and then watched how they connect?
>
> Some of those pieces contain metal atoms; others are organic molecules that can link them together. The interesting part isn't just the pieces themselves. It's the larger pattern they can form—and the spaces that can appear inside it.

This is a **proposed voice sample**, not a replacement for the author's missing working manuscript. Its role is to test warmth and clarity against the actual figure before drafting the full piece. Verify and refine scientific wording as the figure and source decisions settle.

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

1. **Narrative title and tone:** confirm the working H1/deck and whether the proposed two-paragraph tone probe matches the author's voice.
2. **Slider and scene language:** approve **pieces → 1³ → 2³ → 3³ conceptual repeats**, with a fixed-view/auto-fit explanation rather than falsely calling every cube a crystallographic unit cell.
3. **Pore marker:** approve a single illustrative, unlabeled-by-size sphere to signify *potential voids*, not a guest-size or uptake result.
4. **Scientific gate:** review the existing calculated MOF-5 coordinate source and choose whether an atomistic/verified chemistry mode is feasible for the first preview or should follow later.

**Next execution step, after this review:** build a **draft-only** Hugo shortcode prototype using the [figure spec](article-01-interactive-figure-spec.md) in an isolated branch, then evaluate the diagram and a tightly edited opening together. Keep the source article a draft. Do not publish until the author-approved manuscript, source validation, figures, and mobile tests are complete.
