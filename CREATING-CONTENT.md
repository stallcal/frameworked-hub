# Frameworked content workflow

The site is prepared for publication through the existing Netlify deployment. Use the local preview for draft work.

## Review the preview
From this folder run:
```powershell
hugo server --buildDrafts --environment preview --bind 127.0.0.1 --port 1313
```
Open http://localhost:1313/. Stop with Ctrl+C.
A normal `hugo --environment production` excludes all draft pages.
Never publish a build made with `--buildDrafts`.

## Where content lives
New content is in `site-content/`. The original template content is preserved in `content/` and is excluded by the new contentDir setting. Unused original static files are preserved in archive/starter-static/, outside published output.

- learn/: approachable guides.
- articles/: essays and companion videos.
- explore/: individual structure profiles.
- about/: mission and research home.

The draft examples are format demonstrations, not completed articles. They must not be presented as Caleb’s published writing. About-page wording is proposed copy for Caleb to review.

## Send a draft
Send your text or outline, intended audience, original paper links/DOIs, figures with attribution/reuse details, and any video link. The assistant can place it in the appropriate template. You do not need to edit configuration or HTML.

## Make a new page
```powershell
hugo new content --kind guide learn/my-topic/index.md
hugo new content --kind essay articles/my-essay/index.md
hugo new content --kind structure explore/my-material/index.md
hugo new content --kind spotlight articles/my-paper/index.md
hugo new content --kind video articles/my-video/index.md
```
All templates start with draft: true. Use description for the short listing text.
Use `series_order` for the suggested order within a series. Published story listings use `date`, newest first; `weight` only orders the local in-review list.

Only the three preview examples have example: true. For a finished real article, omit that field. After explicit editorial approval, set `editorial_status: approved`, add the actual publication `date`, and set `draft: false`. Builds reject published stories without approval metadata or a date, and reject unresolved editorial notes and figure placeholders.

## References
Add a reference in YAML front matter:
```yaml
references:
  - id: "1"
    authors: "Author names"
    year: 2026
    title: "Verified title"
    publication: "Journal, volume, pages"
    url: "https://doi.org/VERIFIED-DOI"
    # Optional author-hosted full text:
    # access_url: "https://..."
```
Place `{{< cite "1" >}}` immediately after the relevant claim. Missing IDs fail the build. The references section renders automatically.
Distinguish primary literature, reviews, and reference resources with the optional kind field.

## Figures
Use an original or reuse-permitted figure:
```text
{{< figure src="/images/my-figure.webp" alt="Meaningful description" caption="What the figure explains." source="https://source.example/" credit="Creator; modifications made" license="License name" licenseURL="https://license.example/" >}}
```
Do not add numerical properties, topology assignments, or downloadable CIFs without verified provenance.
The MOF-5 image and its license are documented in ASSET-CREDITS.md.

## Links and optional video
related is a list of content paths, such as ["/learn/what-is-a-mof"]. Only available pages render.
video_url creates a real link to an existing video; transcript optionally links to an existing transcript page or file. Empty fields produce no player or broken control.
structureImage is only used for the MOF-5 example. For new materials, add a figure with its own attribution.

## Before eventual publication
Review scientific wording, all sources, image rights, and example status. Replace in-development copy with material actually ready to share. Check the production build and remove unused starter downloads. Publishing is handled by the existing Netlify connection to GitHub; netlify.toml pins Hugo and the production build command.

## New starter readings

Three sourced working drafts are available in the preview: `learn/mof-definition`, `articles/water-harvesting`, and `articles/pfas-groundwater`. They are short introductions, not comprehensive reviews. The two spotlights follow topics from the Wriedt Lab research page (https://labs.utdallas.edu/wriedt/research/); scientific claims cite the original publications. The definition guide cites the IUPAC recommendations, explicitly labeled as such.

The spotlights currently summarize findings available in the primary papers’ abstracts; quantitative comparisons and detailed mechanism explanations should wait for full-text and supporting-information review. Read each draft for scientific wording and your preferred voice before changing `draft` to `false`. The home page stays minimal. The Articles index collects stories from articles/ and learn/. Structure profiles remain in explore/. Example pages appear in a collapsed format-examples section in the preview. Drafts remain excluded from production.

Suggested next topics: a topology guide with a verified net illustration; a structure profile built around a provenance-checked CIF; and a spotlight on light-responsive frameworks. These are editorial ideas, not claims that those pages already exist.

## Retro design update
The navigation is Home, Articles, About. Explore is added automatically only when a published structure profile is available. Existing lesson and structure URLs remain valid; all readings are collected at /articles/. The previous design files are backed up locally in .preview/before-retro/. Libron is retained; navigation and small labels use the system monospace Courier New. The homepage retains the original PNG logo on Framework White. The earlier decorative texture is preserved in assets but is not rendered. No client-side JavaScript is required for navigation or contents disclosure.


## Collections and reading order

Series definitions live in `data/series.yaml`. Use the stable ID, not its display title:

```yaml
draft: true
editorial_status: needs-review
series: ["introduction-to-mofs"]
series_order: 1
format: "Short story"
featured: true
primer: ["/learn/mof-definition"]
# Set only when actually publishing:
# date: 2026-10-20
# substack_url: "https://..."
```

The five IDs are `introduction-to-mofs`, `mof-primer`, `tools-and-techniques`, `paper-notes`,
and `history-of-porous-materials`. Use one primary series per story, with a unique positive
integer `series_order`. A story can link across collections through `related` and `primer`.
Series membership is optional for standalone essays. Format describes the piece, not its series.

Populated series appear on `/articles/` and `/series/`; individual series live at `/series/ID/`.
Draft-only series are visible only in draft previews and are labeled accordingly. Empty series
are not advertised. Previous/next navigation follows available stories within the series,
skipping drafts in production. Missing related/primer pages do not produce empty link sections.

The homepage always uses published content, even in the draft preview. Featured, Start Here,
Latest Stories, and Explore sections appear only when they have published content. The first
three use stories, while Explore uses structure profiles. The introductory series is selected
by `params.startSeries` in `config.yml`. No database or topology tool is advertised as available.

## Article-local figures and SVGs

Keep editable originals in the article's page bundle, alongside `index.md`:

```text
site-content/articles/build-with-molecules/
  index.md
  figure-01.svg
```

```text
{{< figure src="figure-01.svg" width="1200" height="600" alt="Describe the information conveyed" caption="Conceptual illustration, not a specific crystal." credit="Original Frameworked illustration" >}}
```

Local resources are resolved automatically. Raster dimensions are inferred; supply SVG dimensions
explicitly. Figures load lazily and stay responsive. Descriptive alt text is required. The shortcode
also retains support for absolute static paths and external image URLs. Never insert a fictional
molecular model to stand in for a verified CIF-based rendering.

For a draft-only figure position:

```text
{{< figure-placeholder number="1" title="Building a MOF" >}}
Describe the planned visual and verification requirements.
{{< /figure-placeholder >}}
```

These placeholders and `editor-note` blocks cause a production build failure if their page is
marked published. Citations should be placed in ordinary article prose, outside `editor-note`
blocks, so Markdown processing does not discard their generated HTML.

## Video and future interactive components

`video_url` links to a real video; `transcript` optionally links to an existing transcript.
`substack_url` links to a real companion essay. Leave these absent until they exist.
For local narrated video assets, retain editable animation sources separately and add a dedicated
video shortcode when there is a real video to embed, with captions/transcript and a poster.

Future viewers should use dedicated shortcodes and page-specific JavaScript assets, with a text
alternative, responsive container, and lazy initialization. Do not add a site-wide JavaScript
framework for a single interactive component. The proposed data/provenance structure is in
`docs/topology-data.md`; no topology database or molecular explorer is implemented yet.

## Validate changes

Use the Hugo version pinned in `netlify.toml` (0.154.5):

```bash
hugo --buildDrafts --environment preview --destination public --cleanDestinationDir
hugo --environment production --destination public-production --cleanDestinationDir
python3 scripts/verify_site.py
python3 scripts/test_editorial.py
```

The editorial tests create approved/draft/future fixtures in a temporary copy and exercise series
ordering, published-only homepage sections, draft-safe navigation, citations, local SVGs, and build
failures for unfinished content. They never change real article publication status.
Set `HUGO=/absolute/path/to/hugo` when the binary is not on PATH.

Current palette: `docs/brand-palette.md`. Article 01 review: `docs/article-01-review.md`.
Local preview is separate from deployment. Pushes to the connected Netlify production branch can
publish automatically; review changes and obtain approval before pushing or deploying.
