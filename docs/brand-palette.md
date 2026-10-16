# Frameworked brand palette

The user-selected palette is implemented in `assets/css/frameworked.css`.
The site retains its wordmark, Libron typography, logo asset, and overall layout.

| Color | Hex | RGB | CSS token | Use |
| --- | --- | --- | --- | --- |
| Framework Blue | `#084B9E` | 8, 75, 158 | `--blue` | Identity, wordmark, links, focus outlines |
| Framework White | `#F7F9FC` | 247, 249, 252 | `--paper` | Main background |
| Structural Navy | `#1C3049` | 28, 48, 73 | `--navy` | Headings and diagram labels |
| Graphite | `#404040` | 64, 64, 64 | `--ink` | Body text and existing logo |
| Framework Green | `#089E4B` | 8, 158, 75 | `--green` | Secondary accents and scientific graphics |
| Oxide Red | `#9E382E` | 158, 56, 46 | `--red` | Active-navigation underline, draft markers, and selective annotations |

Divider and muted-text colors are derived from navy and the page background with CSS `color-mix`.
The old red/cobalt halftone asset is preserved but is no longer rendered on the homepage.
No scientific raster image has been recolored, and the existing logo remains unmodified.

## Readability

Approximate WCAG contrast ratios on Framework White: Blue 7.93:1; Navy 12.70:1;
Graphite 9.83:1; Green 3.32:1; Oxide Red 6.51:1.
Green is suitable for accents and sufficiently large graphics, not normal-size text on this background.
Do not communicate scientific categories, selection, or errors by color alone: add labels, shapes, or line styles.
These color calculations do not establish full accessibility compliance.

## Figures

Keep original SVGs with stable component groups such as `nodes`, `linkers`, `labels`, and `arrows`
in the relevant article's page bundle. Retain editable sources and document any exported derivatives.
Store colors as reusable styles rather than baking them separately into every component.

Conceptual drawings must say that they are abstractions. Atomistic drawings must identify the
verified crystallographic source, representation, and element-color legend. A brand palette is
not an instruction to replace standard atom colors without explanation.

Article 01's two figures remain editorial placeholders. No atomic coordinates, topology data,
or experimentally accurate structural renderings have been invented.
