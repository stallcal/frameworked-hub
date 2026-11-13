# Article 01 — interactive figure specification

**Status:** proposed design, review before implementation. **Not approved as crystallographic model or article copy.**  
**Parent:** [Article 01 editorial storyboard](article-01-interactive-storyboard.md) · canonical draft `site-content/articles/build-with-molecules/index.md`.  
**Reference only:** [ChemTube3D's MOF-5 explorer](https://www.chemtube3d.com/MOF-MOF5/) demonstrates useful cavity, unit-cell and cutaway controls. Build a distinct, original Frameworked interaction; do not copy its interface or 3D assets.

## The teaching objective

**By dragging one slider, the reader sees how a local connection becomes a repeating three-dimensional framework; by revealing one ball inside a void, the reader sees why the geometry invites questions about porosity but does not answer them experimentally.**

Keep a single figure and a single narrative through the article. It should not become a separate full-featured structure editor.

## Main figure: controls and states

**Scale slider** — integer values 0–3, one step per position, keyboard-accessible and clearly labeled:

| Slider value | Visible title | Visual behavior | One-sentence explanation |
| --- | --- | --- | --- |
| **0** | **Start with the pieces** | Show one labeled metal-containing *node* representation and one labeled organic *linker* separately, plus a hint of a possible connection; no claim that this pair is a complete MOF. | “These are the pieces in our simplified model: a metal-containing building unit and an organic linker.” |
| **1** | **1 × 1 × 1 repeating block** | Assemble a single cube-like **conceptual pcu network motif** from the same node/link visual vocabulary; annotate cropped connections continuing beyond the drawing. | “One block reveals a three-dimensional pattern, but the framework does not end at its edges.” |
| **2** | **2 × 2 × 2 blocks · 8 repeats** | Tile the same motif twice along each of three directions, deduplicating shared nodes and linkers on boundaries; retain one clearly identified selected cavity. | “The pattern repeats in all three directions without changing how its parts connect.” |
| **3** | **3 × 3 × 3 blocks · 27 repeats** | Tile 27 motifs, keeping the scene legible; emphasize the repeating connectivity with modest de-emphasis of distant lines, not new atoms or chemistry. | “A bigger piece of the same framework contains more repeats—not necessarily larger pores.” |

**Critical terminology gate:** The first prototype illustrates *conceptual repeating blocks*, **not experimentally established crystallographic unit cells**. If we later render a vetted MOF-5 CIF, the label can become **1 × 1 × 1 unit cell / 2 × 2 × 2 / 3 × 3 × 3 supercell**, but only if the replication follows the verified lattice vectors and the chosen cell is stated. One drawn cube is not automatically MOF-5's conventional unit cell. The finite display has boundary nodes missing neighbors offscreen; do not imply isolated, terminated cubic molecules.

**Initial slider position:** 0, with a compact visual instruction “Drag to build the framework.” Controls should still be understandable if the reader jumps directly to any step. The 3D camera angle should stay consistent as the model grows; auto-fit the model and show a small “view zooms to fit” label so shrinkage on screen isn't mistaken for changing pore size. An explicit reset restores slider 0, base camera, and pore toggle off.

### Second control: representation (limited scope)

- **Network (default):** the conceptual simplified arrangement of labeled nodes and linkers, using original Frameworked artwork. This view powers every slider state in the first preview.
- **MOF-5 chemistry (later/conditional):** switch to a chemically detailed representation from an audited dataset, with element legend and its source/variant shown. Do **not** ship a clickable but inaccurate placeholder. This control should simply be absent in the first preview until the scientific gate passes. When enabled, the structural image and network must correspond under a documented node/link contraction; do not swap to an unrelated drawing.
- Keep **“network vs chemistry”** separate from **“how many repeats”**. Do not make building blocks, MOF-5, topology, and pore into four mutually exclusive scale positions.

### Third control: pore marker (overlay)

A compact **Show a pore** switch is available at steps 1–3, disabled at step 0 with the explanation “Build the framework first.” It displays **one small translucent green ball** centered in a visibly chosen cavity, with a leader label:

> **Potential void · conceptual illustration · not to scale**

At 2× and 3×, show **one** marker, not a green ball in every cavity. Optional subtle translucent cavity halo is fine if it does not look like a measured pore boundary. Use a cutaway/attenuated front strut **only if needed** to see the marker, with a clear label that the view is cut away.

**No physical pore-size claim yet.** The ball represents *space*, **not** a particular gas molecule, measured cavity radius, pore-limiting aperture, or an experimentally verified diffusion path. If we later add calibrated guest-size or pore-size comparisons, their data and dimensional workflow need independent review: input quantity and units; whether each value is a **radius or diameter**; geometric definition (cavity vs window); the model's length-scale factor; formula; and resulting units, with uncertainty/assumptions. Do not infer accessible porosity from a displayed sphere.

## Visible text behavior

The text immediately under the figure has three independent parts, not a long paragraph that changes constantly:

1. **State label**, as in “2 × 2 × 2 · Eight repeating blocks.”
2. **One sentence of what changed**, from the scale-state table above.
3. **One scientific qualification when relevant**, always visible in pore mode: “The highlighted space is schematic. Actual uptake depends on the material and conditions and requires measurement.”

A compact persistent legend identifies **node**, **linker**, and, when enabled, **potential void** by text plus shape, not color alone. No rotating fact-carousel, repeated definitions, fake adsorption animation, or long blocks of help text around the controls. Captions should not duplicate the nearby paragraph.

## Visual direction

- **Frameworked colors:** navy `#1C3049` for outlines/labels, blue `#084B9E` for linkers, oxide red `#9E382E` for conceptual nodes, green `#089E4B` for the one optional pore marker. Light surfaces such as `#F7F9FC`, `#EAF1F9`, a muted powder-blue and restrained blush/seafoam shading keep the scene pastel-like.
- Neobrutalist interface frame around the **control panel**, not a shadow on every node. A clean bright stage, minimal visual chrome, and clear editorial typography.
- Shape differentiation: nodes as rounded solids, linkers as narrow struts, pore marker as translucent sphere. Always include key labels. **These colors indicate roles, not actual element identities.** A later atomic MOF-5 model must separately document its element colors.
- Prefer lightweight 2.5D/SVG or a small 3D renderer capable of accurate node/link replication. Blender-authored visuals can later provide coherent textures, figures, or key frames, but must not replace selectable interactive geometry or introduce inaccurate atom positions.

## Implementation and acceptance

- Reuse useful ideas and validated geometry from `/tools/node-and-linker/`, but audit the existing calculated-MOF-5 data and coordinate provenance before displaying it as experimental structure.
- Distinct structured model data: nodes, edges, repeat vectors, source/representation type, and optional pore-marker anchor. Deduplicate shared periodic nodes/edges between repeated blocks. Do not infer a bond merely from nearby screen positions.
- At the largest conceptual step (3³), a simple cubic segment has **64 unique corner nodes and 144 displayed edges**, before accounting for any boundary continuation cues; implement with shared endpoints, not 27 overlapping whole cubes. This is a graph count for the **schematic**, not an atom count or crystallographic unit-cell atom inventory.
- Keyboard: Tab/arrow interaction for slider, labeled toggle and reset button, visible focus, an accessible static summary of the active view; no auto-motion. Touch targets at least about 44 px. Test 320/390/430 px phones, tablet, desktop, reduced-motion and no-JS fallback.
- Show a meaningful static figure and summary before JavaScript loads; do not make the article unreadable without an enhanced visual. A noninteractive image can be a temporary first preview if needed, but it must be honestly labeled.
- Tests: 0→1→2→3 and backwards; rotate/reset; all three toggle combinations where allowed; no missing/duplicated boundary struts, stable figure size, no overlapping captions, acceptable frame rate on a phone, and accessible labels.
- **Do not start implementation until the scale semantics, sphere meaning, opening narrative, and MOF-5 data gate are jointly approved.**

## Joint review decisions

1. Is the default figure a **conceptual cubic net** with a later vetted MOF-5 chemistry mode? (Recommended: **yes**.)
2. Is the ball an **illustrative potential-void marker**, never a guessed guest or numerical pore probe in v1? (Recommended: **yes**.)
3. Are the scale labels `pieces → 1³ → 2³ → 3³` with no additional sliders in v1? (Recommended: **yes**.)
