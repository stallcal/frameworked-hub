# Frameworked roadmap

Updated 2026-11-03. This file describes the `feat/frameworked-science-tools` review branch. It does not claim that the new tools are published.

Review implementation: [draft PR #9](https://github.com/stallcal/frameworked-hub/pull/9).

Start with [the tracking issue](https://github.com/stallcal/frameworked-hub/issues/8). Read [the project map](docs/PROJECT-MAP.md) for architecture and [the review notes](docs/science-tools-review.md) for validation and limitations.

## Current work

| Work | Purpose | Status | Review |
| --- | --- | --- | --- |
| Bragg’s law explorer | Education | v0.1 implemented; scientific/release review pending | [#4](https://github.com/stallcal/frameworked-hub/issues/4) |
| Adsorption unit converter | Research utility | v0.1 implemented; independent calculation/release review pending | [#5](https://github.com/stallcal/frameworked-hub/issues/5) |
| Pore-accessibility playground | Education | v0.1 implemented; model/visual review pending | [#6](https://github.com/stallcal/frameworked-hub/issues/6) |
| Separate repos and GitHub Project | Infrastructure | Blocked by current GitHub connection permissions | [#7](https://github.com/stallcal/frameworked-hub/issues/7) |
| Scherrer results layout | Research utility | Existing independent draft PR; leave unmerged | [PR #3](https://github.com/stallcal/frameworked-hub/pull/3) |

Publication requires approval. Do not resolve a review issue merely because tests pass. Website main automatically deploys through Netlify; a review branch is not a production release.

## Next steps

1. Review each tool’s wording, representative calculations and mobile experience. Use its MODEL.md and issue checklist.
2. Approve and merge only the reviewed scope; retain independent Scherrer review.
3. When account permissions are available, extract the standalone projects, preserving history, and make the website consume pinned versions. No second hosting service is needed.
4. Add work items to the cross-repository GitHub Project. Keep issue discussions beside their source code.
5. Resume Article 01 and explainers that link to the tools; existing manuscript/figure and citation review gates remain in place.

## Candidates after this sprint

| Candidate | Primary purpose | Small first scope |
| --- | --- | --- |
| Peak-shape explorer | Education | Gaussian/Lorentzian/pseudo-Voigt profiles; FWHM vs integral breadth; explicit simulation |
| Adsorption CSV conversion | Research | Apply the reviewed converter to columns; export units and reference conditions with data |
| Uncertainty calculator | Research | First-order propagation for explicitly defined independent quantities; disclose covariance limits |
| Geometry-to-topology library | Education | Curated, sourced net records before an interactive matrix; follow docs/topology-data.md |

Do not add BET fitting, automated phase identification, or real-crystal pore metrics casually. Each needs a separate model specification, data provenance and meaningful validation.
