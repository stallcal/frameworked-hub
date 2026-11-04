# Framework Atlas — curated known-net explorer (design specification v0)

**Status:** concept and scope specification, not an implemented tool or approved scientific dataset.
**Repository goal:** eventual standalone `stallcal/net-atlas`; integrate reviewed releases into `frameworked-hub` only with explicit approval.

## Learning objective

Help students distinguish **local node coordination**, **global network topology**, **dimensionality**, and **the chemistry used to realize a net**. The first release is an atlas of known nets, **not** a network generator, automatic CIF topology recognizer, or predictor of MOF stability.

## Curated opening collection

| RCSR net symbol | Typical idealized coordination | Dimensionality | Opening teaching focus |
| --- | --- | --- | --- |
| `hcb` | three-connected | 2D | Honeycomb arrangement vs connectivity |
| `sql` | four-connected | 2D | Square lattice, periodic graph and unit cell |
| `dia` | four-connected | 3D | Same coordination as sql; different topology/dimensionality |
| `pcu` | six-connected | 3D | Simple cubic connectivity; MOF-5 node/linker reduction |

**Curation gate:** verify each graph and symbol against a named topological database/primary source and source-compatible geometry. Do not infer net identity solely from vertex coordination. Curated illustrations are not automatically atomistic structures.

## First interactive lesson (start with sql and pcu)

1. **Net view:** show simplified vertices and edges, highlight one node and all incident edges, label its coordination count, allow rotation/zoom, and toggle repetition across unit-cell boundaries.
2. **Compare:** put `sql` and `pcu` side by side to show why 2D vs 3D connectivity is a structural difference, not just a rotation.
3. **Structure bridge:** curated MOF-5 schematic reduces its Zn4O(COO)6 six-connected cluster to a six-connected vertex and its BDC links to edges in a `pcu` network. Label cluster chemistry, net representation, and schematic rendering distinctly.
4. **Elastic schematic:** vary a drawn edge length while retaining graph connectivity to illustrate why geometry can change without changing topology. Do not claim physical elastic behavior or material stability.

## UX specification

- Net selector with `hcb`, `sql`, `dia`, `pcu`; concise definition, dimensionality, vertex degree, and verified source.
- Camera controls: rotate and zoom (3D), reset orientation, highlighted unit or repeated network, optional axes.
- Inspector: selected vertex and its incident edges, repeating boundary indicator, explicit **schematic/idealized** notice.
- Accessible fallback: static labeled diagram and textual adjacency/coordination description.
- No automatically generated framework–net assignments; any named example needs its own primary literature and crystallographic reference.

## Data, source and review contract

- Store curated net geometry as versioned records with vertices, edges, periodic-cell translations and provenance; **do not use a single fixed drawing as evidence of topology**.
- Validate periodic connectivity, repeated vertex degree, edge translations, duplicates and boundary joins in automated tests.
- Check source licensing before redistributing geometry. Source visual inspiration does not authorize copying figures.
- Compare selected known nets to RCSR/IUCr-level terminology. Distinguish **vertex degree** from metal coordination number.
- A model displaying a real MOF must have sourced crystal structure and an explicit reduction protocol; “Zn4O node” shorthand must not imply four zinc atoms themselves are six-connected.
- Publish to Frameworked only after scientific, visual/accessibility and browser review; the draft Bragg work is independent.

## Reference starting points

- Ockwig et al., *Reticular Chemistry: Occurrence and Taxonomy of Nets and Grammar for the Design of Frameworks*, Acc. Chem. Res. 2005, DOI 10.1021/ar050022l (confirm availability and geometry rights before copying).
- Alexandrov et al., **Let's Talk about MOFs—Topology and Terminology of Metal-Organic Frameworks and Why We Need Them**, Crystals 2015: https://www.mdpi.com/2073-4352/5/1/154
- MOF-5 pcu example: https://pmc.ncbi.nlm.nih.gov/articles/PMC11364505/
- RCSR Topological Net Database (confirm exact record, graph definition and reuse rights before import).

## Excluded from first release

- Free-form graph editor; graph identification from arbitrary node-linker construction.
- CIF import/automatic topology identification.
- Energy minimization, adsorption/porosity calculations or unvalidated physical-scale measurements.
- Generated material examples or guessed net geometries.

## Next design check

Prototype a trustworthy `sql` vs `pcu` comparison and a node-selection inspector before adding other nets. Ask the user to review whether the bridge from abstract graph to MOF-5 clarifies rather than confuses the chemistry.
