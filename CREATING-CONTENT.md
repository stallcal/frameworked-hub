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
Set weight to control order; lower numbers appear first.

Only the three preview examples have example: true. For a finished real article, omit that field and set draft: false after editorial review.

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

The spotlights currently summarize findings available in the primary papers’ abstracts; quantitative comparisons and detailed mechanism explanations should wait for full-text and supporting-information review. Read each draft for scientific wording and your preferred voice before changing `draft` to `false`. The home page stays minimal. The Articles index collects pages from articles/, learn/, and explore/. Example pages appear in a collapsed format-examples section in the preview. Drafts remain excluded from production.

Suggested next topics: a topology guide with a verified net illustration; a structure profile built around a provenance-checked CIF; and a spotlight on light-responsive frameworks. These are editorial ideas, not claims that those pages already exist.

## Retro design update
The navigation is Home, Articles, About. Existing lesson and structure URLs remain valid; all readings are collected at /articles/. The previous design files are backed up locally in .preview/before-retro/. Libron is retained; navigation and small labels use the system monospace Courier New. The homepage logo is the original PNG over a separate decorative texture, so either can be replaced independently. No client-side JavaScript is required for navigation or contents disclosure.
