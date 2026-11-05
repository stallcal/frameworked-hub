# Frameworked Science Atlas — Event editorial workflow

**Status:** research preview, not an authoritative visitor guide. The live domain is unchanged.

## Canonical source of truth

- `static/atlas/data/events.json`: dates, local timezone, venue ID, access, source URLs, review notes.
- `assets/atlas/atlas.js`: Atlas map and calendar logic with an embedded copy of the JSON.
- `scripts/atlas/sync_events.py`: validates record integrity and regenerates the embedded copy.

From the repository root, edit `events.json` and then run:
```bash
python3 scripts/atlas/sync_events.py
python3 scripts/atlas/sync_events.py --check
```
Do not hand-edit both copies. Deployment preview links use Netlify's Hugo build (which publishes the `static/` directory).

## Editorial gate for every event

1. Locate a dated **official organizer source** and verify institution identity. Generic search results alone are insufficient.
2. Record a specific start date and local time. Use `America/Chicago`, with correct ISO offset (`-06:00` in November/December, `-05:00` during daylight saving).
3. Distinguish public, registration-required, and restricted/member-only access. A campus is not automatically an open event venue.
4. Note fees, age restrictions, virtual vs in-person delivery, weather cancellations, ticket requirements, and any sold-out indication.
5. Match `institution_id` to the map directory. Avoid creating an event under the wrong campus or museum.
6. Mark `source_checked` when an official source supports the listing; use `approved` only after manual editorial review.
7. Recheck events close to the date and flag changed/cancelled sessions. Never interpret a dated listing as proof that tickets remain available.

## Data interpretation

A calendar record represents **one occurrence**, not necessarily one unique program. The Perot Museum's three-day camps have separate daily occurrences so all scheduled days appear on the calendar. Registration is for the full camp—not for each individual day. Saturday Stargazing entries refer to the published **7 PM** timed sessions; other times are possible and ticket availability is NOT checked. For continuous exhibits, the calendar records a launch/opening day and links to the organizer's full schedule.

Sources are reviewed through the user's weekly Science Atlas event research check. **That recurring research check sends candidate discoveries for human review; it does not commit updates to GitHub or automatically publish listings.** To automate publishing later, build a separate, source-specific and legally permissible ingestion pipeline with duplicates, cancellations, change logs and a review queue.

## Deploy preview

`https://deploy-preview-16--frameworked-hub.netlify.app/atlas/`

Pull request: `https://github.com/stallcal/frameworked-hub/pull/16`

Do not merge into `main` until access conditions, marker accuracy, source terms and editorial completeness are reviewed.
