# Article 01 — rotatable conceptual MOF figure (3D preview)

**State:** Experimental, pending visual review. This is **not** a crystallographic MOF-5 structure, molecular dynamics or adsorption calculation. No published Article 01 was changed.

## Review route and implementation

- Draft PR: #64, branch `feature/article-01-mof-build-visual-v1-20261113`.
- Cloudflare PR preview route: `/preview/mof-build/` (a deployment URL must be confirmed separately).
- Unpublished article location: `site-content/articles/build-with-molecules/index.md` (`draft: true`).
- Shortcode: `layouts/shortcodes/mof-build-3d.html`.
- Styles: `assets/mof-build-3d/style.css`.
- Runtime: `static/js/mof-build-3d/{model,scene,app}.js`.
- Prior 2D shortcode/JS/CSS are retained on the branch as an unused fallback for design comparison, not rendered beside 3D.
- The pinned `three@0.187.0` module and matching OrbitControls are requested from jsDelivr using the official Three.js import-map pattern. **Operational caveat:** these modules are not yet self-hosted or source-integrity-checked; external loading failures leave a static diagram and text.

## One consistent geometry

The 3D model uses **arbitrary model units**, not Å or nm. The only purpose is to teach connectivity and repeated space.

| Quantity | Input value and unit | What it represents |
| --- | --- | --- |
| Nearest-neighbor node pitch, `L` | `1.000 model length unit` | Distance between neighboring conceptual grid nodes |
| Node sphere radius | `0.115 model length unit` | Stylized appearance |
| Linker-cylinder radius | `0.052 model length unit` | Stylized appearance |
| Green void-sphere **radius**, `r` | `0.580 model length unit` | Enlarged, solid conceptual cavity marker |
| Green sphere **diameter**, `d = 2r` | `1.160 model length units` | (2 × 0.580 model units = 1.160 model units) |
| Displayed sphere-diameter/edge-pitch ratio, `d/L` | `1.160` dimensionless | `1.160/1.000 = 1.160`, or **116% of one repeat pitch** |

Simple-cubic geometric clearance from a block center to a strut surface is
`R_available = sqrt((L/2)^2 + (L/2)^2) − r_strut`
`= sqrt((0.5)^2 + (0.5)^2) − 0.052 = 0.6551 model length unit`.
The chosen sphere radius `r = 0.580` is less than that simple model's `0.6551` clearance and also fits between corner-node spheres. Code tests check nonintersection against **all displayed nodes and segments** at 1×, 2× and 3×.

**Dimensional qualification:** The sphere diameter (1.160 model units) exceeds one node-to-node repeat pitch (1.000 model unit), so it crosses imaginary unit-block faces. Those faces are not physical walls. The sphere remains separated from drawn rods and nodes, but does **not** represent the maximum physically accessible sphere or a window aperture.\n\n**Evidence gap—assumption applied.** That geometric compatibility is valid only for the idealized cubic graph and chosen rod/node thicknesses. It is **not** evidence of a physical crystal's free-sphere diameter, pore-limiting aperture, probe accessibility or adsorption capacity. A future experimentally grounded view needs a verified CIF, a stated atom-radius model and probe-radius definition, units, structural phase/activation state and uncertainty.

## Behavior and performance

- Four native construction-stage buttons with visible selected and `aria-pressed` states: pieces, 1³, 2³, 3³ repeats. This replaces the discrete slider. Graph nodes and edges are deduplicated at shared faces.
- Native 3D rotation via OrbitControls, pinch/scroll zoom; accessible turn-left/right buttons and reset.
- Pore toggle adds **one** opaque matte sage sphere to a near-facing block; **Focus on pore** appears only when usable and moves the *camera*, never changes sphere dimensions. Camera refits between repeat scales with orientation preservation.
- WebGL hydration begins near viewport entry; no 3D engine download when the figure is not visited.
- Instanced node/edge meshes, subdued matte node/linker materials, less intense lighting and a solid sphere without emissive glow or wireframe rim; no postprocessing or full-time render loop. Display pixel ratio capped at 1.6.
- Static SVG and text remain available when JS, WebGL, or the module CDN fails. The component does not modify global article, tool or atlas CSS selectors.
- Checks: `node --test tests/mof-build-visual.test.mjs tests/mof-build-3d.test.mjs`; GitHub workflow also runs Hugo draft and production builds and checks unpublished-article isolation.

## Joint acceptance gate

1. Evaluate actual Cloudflare preview in mobile Safari and desktop, not just a Hugo compile. Check stage selection, rotation, zoom, reset and contextual focus; verify that the sphere is visually prominent yet does not intersect the schematic struts.
2. Check no clipped canvas, broken CDN imports, missing colors, focus traps or awkward page scrolling. Compare both 1³ and 3³ modes and touch interactions.
3. Decide whether node/linker shapes and material colors match Frameworked's future Blender visual standards.
4. Confirm the caption doesn't suggest that the schematic cubes are MOF-5 crystallographic unit cells.
5. Keep PR #64 draft and the Article 01 content unpublished until those checks and scientific review are complete.
