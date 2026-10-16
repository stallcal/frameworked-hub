# First content: preparation package

Keep the first release small: Article 01 plus an optional supporting primer. Prepare Article 02
as the next story, rather than filling the public site with unfinished sequence cards.
All current content remains a draft; this document is not an editorial approval.

## 1. What If We Could Build With Molecules?

- Collection: Introduction to MOFs, story 1.
- Page: `site-content/articles/build-with-molecules/index.md`.
- Reader: a STEM-interested high-school or undergraduate reader, with no MOF experience assumed.
- Aim: understand the building-block idea and why a picture of open space is not evidence of usable porosity.
- Length: approximately 400–600 words, excluding captions and references; let clarity determine the final length.
- Voice: approachable narration, short paragraphs, technical terms explained at first use.
- Handoff needed: the author's working manuscript from the other conversation. The repository currently
  contains an outline, not that manuscript. Do not silently substitute generated prose for it.

### Story and visual sequence

| Beat | Narration job | Visual job |
| --- | --- | --- |
| A familiar structure | Introduce beams, joints, and connected construction | A simple engineering analogy, clearly separated from chemistry |
| Molecular building blocks | Introduce metal-containing units and organic linkers | Figure 1: an original conceptual assembly scheme |
| Meet a real material | Transition to MOF-5 and explain what the analogy leaves out | Figure 2: abstract connectivity alongside a verified crystal-based model |
| Why the space matters | Distinguish visible cavities from accessible, experimentally demonstrated pores | A restrained guest-removal/adsorption explanation, only if useful |
| The next question | Ask how different units connect | A closing sentence motivating Article 02; no link until that page is available |

### Source preparation and claim ledger

The author-hosted Li et al. PDF was retrieved and its relevant passages inspected during preparation.
The downloaded PDF and extraction are research files outside this repository; they are not redistributed
or licensed by this project's software license. This is a preliminary source check, not final claim review.

Primary source: Li, H.; Eddaoudi, M.; O’Keeffe, M.; Yaghi, O. M. (1999), Nature 402, 276–279.
DOI: https://doi.org/10.1038/46248 . Author-hosted copy:
https://yaghi.berkeley.edu/pdfPublications/nature99-pg276.pdf .

| Intended explanation | Source location / preparation result | Before publication |
| --- | --- | --- |
| MOF definition and potential voids | IUPAC recommendations, https://doi.org/10.1351/PAC-REC-12-11-20; already cited in the primer draft | Review the complete recommendations and final wording |
| MOF-5 uses zinc–oxygen-containing clusters and BDC linkers | Li et al., pp. 277–278: identifies 1,4-benzenedicarboxylate and describes the oxide-centered Zn4O cluster | Check every final sentence and caption against the source |
| Simplification to a simple cubic six-connected net | Li et al., p. 277, paragraph describing replacement of vertices by building units and edges by BDC struts | Verify modern `pcu` nomenclature separately against an appropriate topology source; state the simplification |
| Removal of guests without loss of the framework under the reported conditions | Li et al., p. 279: solvent exchange, evacuation, and a subsequent single-crystal diffraction study | Explain what was measured; do not generalize to arbitrary conditions or every MOF |
| Evidence of accessible pores | Li et al., Figure 3 and pp. 278–279: gas/vapor sorption measurements on desolvated material | Select only the evidence needed for this short story; do not infer capacity from a diagram |
| Molecular drawing of MOF-5 | No verified CIF has been acquired for this figure package | Obtain a suitable dataset, identify the structure variant, check reuse terms, and validate rendering |

Avoid numerical performance claims in this first story unless they serve a clear explanatory purpose.
If surface area is later discussed, preserve the reported analysis model: the original paper describes
an apparent Langmuir estimate; do not relabel it as a BET value.

### Figure 1 production brief

- Original SVG: metal ions or metal-containing clusters + organic linkers → extended framework.
- Caption must say it is a conceptual illustration, not an atomistic model of a particular material.
- Palette: Framework Blue for the primary emphasis, Graphite/Navy for structural lines and text;
  Green or Oxide Red only where they identify a second role. Provide labels as well as colors.
- Editable groups: `metal-units`, `linkers`, `assembled-network`, `labels`, `assembly-arrow`.
- Keep the composition understandable when stacked vertically on a phone.
- Preserve source layers for a later narrated build-up animation.

### Figure 2 production brief

- Show a labeled abstraction and a separate molecular mode; identify what each representation omits.
- Do not invent coordinates or reconstruct an experimental structure from the conceptual cube.
- A schematic cube is not automatically the conventional crystallographic unit cell.
- Distinguish the geometry of atoms within the Zn4O core from the connectivity of the chosen
  topological building unit. A tetrahedral-looking cluster core does not establish a four-connected net.
- Record CIF source/identifier, variant, symmetry treatment, software, rendering settings, and rights.
- Use a consistent element legend. Brand colors do not replace documented atom colors by implication.
- Check periodic connections and the chosen deconstruction with a competent scientific reviewer.

## 2. Supporting primer: What does the name MOF actually mean?

- Existing page: `site-content/learn/mof-definition/index.md`; collection: MOF Primer.
- Purpose: a short optional definition reference, not a compulsory chemistry course before Article 01.
- Preserve the distinction between potential voids and measured porosity.
- Review against the full IUPAC recommendations and add a plain-language explanation of
  coordination network/organic ligand where the current text assumes familiarity.
- Check that the self-test asks about evidence rather than memorization.
- If approved alongside Article 01, its existing primer link becomes available automatically.
- Keep this as a separate mini story; do not duplicate Article 01's construction narrative.

## 3. Next story: Nodes, Linkers, and the Chemistry of Connection

- Collection: Introduction to MOFs, story 2.
- Status: editorial brief only; no empty public article page has been created.
- Reader question: what do we choose as a node, and what chemical connections does a linker make?
- Explain that a topological node can represent a metal-containing cluster rather than one atom.
- Introduce coordination bonds and carboxylate linkers through a verified example.
- Show the mapping from chemical structure to a simplified network, with the representation stated.
- Save systematic topology comparisons for Article 03; do not imply that building-unit shape guarantees a product.
- Candidate supporting lesson: a concise coordination-bonding primer, only if the story needs it.
- Confirm sources and figure needs before drafting; reuse the verified assets from Article 01 where appropriate.

## Working order

1. Receive the Article 01 manuscript; reconcile it with the repository outline.
2. Review the short-story structure and narration voice before polishing individual sentences.
3. Complete the claim ledger and obtain the verified crystal data.
4. Produce original editable figures using the selected palette.
5. Review article, primer links, captions, references, and mobile reading together.
6. Only after approval: resolve every editorial placeholder, set the actual publication date,
   mark the story approved, and remove its draft flag.
7. Check preview and production separately, then publish through the agreed GitHub/Netlify flow.

Longer Substack essays should synthesize several mini stories into a new argument with transitions
and updated references. Do not publish a companion link until the actual essay exists.
