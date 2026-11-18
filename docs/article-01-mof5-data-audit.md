# Article 01 — MOF-5 structural source audit

**Status:** Source verification and next-figure release gate. **No experimental structure has been imported, rendered, or published in Article 01.** Current conceptual 3D Figure 1 is approved for continued development, with material styling retained as a later polish item.

## What the repository currently contains

- Existing public /tools/node-and-linker/ viewer: `layouts/partials/mof/node.html`, `assets/mof/node.js` and `assets/mof/structure.json`.
- The viewer labels its dataset a calculated, evacuated MOF-5 representation. It cites WMD-group/Crystal_structures, `MOFs/MOF-5/MOF5.cif`.
- Audit of those sources on **2026-11-13**:
  - Local `assets/mof/structure.json`: **328** fractional coordinates: Zn **32**, O **104**, C **192**, H **0**.
  - Upstream WMD `MOF5.cif`: **424** fractional coordinates: Zn **32**, O **104**, C **192**, H **96**.
  - All **328/328** local coordinates match upstream non-hydrogen entries by element and exact fractional x/y/z values. Hydrogen is omitted locally.
  - The upstream CIF identifies itself as **“MOF-5, evacuated PBEsol”**, a first-principles-optimized structure, with `a = b = c = 25.86584 Å`, `α = β = γ = 90°`. Its CIF declares `P 1` and explicitly lists atomic positions; that setting should **not** be confused with experimentally assigned `Fm-3m`.
  - The WMD source currently resolves to blob SHA `fbd9e53403aa25982fd0330ed989e89506ae8b70`. The local atom data resolves to blob SHA `4b549d6f98abf19bbac100124b5dbf9733f6d97e`.
- Existing tool colors Zn blue / O red / C graphite represent **chemical elements**. Conceptual 3D Figure 1 colors red nodes / blue linkers / green void represent **pedagogical roles**; do not carry the conceptual legend into a real atomistic rendering.

Primary source: [WMD MOF5.cif](https://github.com/WMD-group/Crystal_structures/blob/master/MOFs/MOF-5/MOF5.cif); [WMD collection README](https://github.com/WMD-group/Crystal_structures/blob/master/README.md).

## Stronger experimental crystallographic source found

- CCDC **256966**, CSD refcode **SAHYOQ**, DOI [10.5517/cc8md7h](https://doi.org/10.5517/cc8md7h). CCDC identifies this as an **experimental crystal structure determination** associated with Li, Eddaoudi, O'Keeffe, and Yaghi, *Nature* 402, 276 (1999), DOI [10.1038/46248](https://doi.org/10.1038/46248).
- Deposited **24 March 2005**, while the associated paper was published in **1999**. This is not a contradiction: deposition and associated publication dates refer to different events.
- CCDC entry reports cubic `Fm-3m` (No. 225), `a = b = c = 25.8849(7) Å`, `α = β = γ = 90°`. Verify the **specific data state, occupancy/disorder, solvent handling and coordinates** in the downloaded experimental CIF before using it as a model.
- Source: [CCDC SAHYOQ entry](https://doi.org/10.5517/cc8md7h), [1999 original paper](https://doi.org/10.1038/46248). CCDC offers CIFs from Access Structures but requires acceptance of conditions on initial download: [CCDC guidance](https://support.ccdc.cam.ac.uk/support/solutions/articles/103000306188-how-do-i-download-cifs-from-the-access-structures-service-).

### Quantitative distinction

- Computed WMD cubic edge `a_calc = 25.86584 Å`.
- CCDC SAHYOQ reported experimental cubic edge `a_exp = 25.8849 Å` with reported last-digit uncertainty `(7)`.
- `Δa = a_exp − a_calc = 25.8849 Å − 25.86584 Å = 0.01906 Å`.
- `Δa/a_exp × 100 = 0.01906 Å / 25.8849 Å × 100 = 0.07363%` (approx.).
- These values compare different coordinate sets, and possibly different experimental/computational treatments. **Do not** treat their small lattice-edge difference as proof of atomistic agreement or validated pore geometry.

## Attribution and redistribution review

**Evidence gap—assumption applied.** The WMD collection README displays a **CC BY 4.0** badge, but the repository's actual `LICENSE` file contains **Creative Commons Attribution 3.0 Unported** legal text. This is a genuine version inconsistency, not proof of permission for every downstream use. Source credit and a link to the original should remain. Clarify governing reuse/attribution conditions before redistributing CIF data or derivatives for any commercialized Frameworked content.

CCDC Access Structures asks users to accept conditions of use before downloading a CIF. A publicly searchable experimental structure is **not** by itself permission to republish the full dataset. Review conditions before hosting raw atom coordinates or derivative assets on Frameworked. Avoid implying that a third-party repository license covers CCDC data.

## Figure 2 recommended build gate

1. Keep existing Figure 1 exactly as an **original conceptual 3D network**; no atomistic claims or measured pore sphere. The only outstanding user-feedback item is future material-surface polish.
2. Obtain experimental CIF for **SAHYOQ / 256966** through the legitimate CCDC Access Structures workflow. Review conditions, depositor metadata, occupancy, solvent/activation state, coordinate units, cell and symmetry.
3. Parse fractional coordinates and symmetry with a validated crystallography parser (Gemmi or equivalent), not by treating a symmetry-reduced CIF as already fully expanded.
4. Build a separate **MOF-5 chemistry** panel/representation with an element legend, atomistic coordinates and periodic boundary-aware bonds. Label which positions and sample state are represented; distinguish `a,b,c` lattice vectors from an arbitrary schematic cube.
5. Verify `Zn₄O` clusters and BDC linker identity by inspected topology and literature, then document the **six-connected pcu reduction** separately from atomic Zn tetrahedral coordination.
6. Cross-check the output against crystallographic software and at least one known published view, plus element counts and unit-cell expansion. Cite the data source directly in the Figure 2 caption.
7. **Do not use the green conceptual sphere as a measured MOF-5 cavity size.** A later physical size overlay requires a stated probe radius, atomic radius set, cavity vs window definition, scaling to Å/nm, and appropriate uncertainty. Experimental sorption capacity is an independent measurement.
8. Article 01 stays `draft: true` and Figure 2 stays an editorial placeholder until the scientific and redistribution gates are jointly cleared.

## Integration / PR discipline

- Draft design PR **#64** holds the accepted-in-principle Figure 1; do not merge or publish Article 01 implicitly.
- Separate draft planning PR **#63** includes an earlier slider-based figure spec. It is now **outdated relative to #64** on controls (four buttons), 3D geometry, and the enlarged opaque sphere. Reconcile or explicitly supersede those parts before combining PRs; avoid reverting Figure 1 through a planning-doc merge.
- No changes to production Atlas, Tools other than the existing source audit, home styling, or chemistry pages are required for this audit.
