# Frameworked Science Atlas — preview release checklist

**Current stage:** Texas pilot / draft PR #16 — **not approved for production**.
Last assessed: 2026-11-05. This checklist records implementation status,
editorial gaps, and proposed release gates; it does not certify places or events.

## What works in the current preview

- [x] Texas county map with 83 institution *candidate* profiles, 29 in DFW.
- [x] DFW major highways from TxDOT, embedded as an offline-safe baseline.
- [x] Census TIGERweb primary, secondary and local roads progressively loaded for
  the visible viewport at increasing zoom, with paginated requests, basic label
  collision avoidance, cache and timeout/failure fallback.
- [x] City labels separated visually from selectable venue markers; marker clusters.
- [x] Venue profile with approximate-pin warning, local-road exploration and
  external address lookup.
- [x] Calendar with 43 dated *occurrences*, local Central Time, region/type/access
  filters, organizer source links, ICS export, and correct inclusion of restricted
  events under the All access filter.
- [x] Separate editable JSON sources under `static/atlas/data/` for places, events,
  and embedded TxDOT roads. Run `python3 scripts/atlas/sync_events.py` to rebuild
  inline data; run `python3 scripts/atlas/sync_events.py --check` for consistency.
- [x] GitHub Actions validation of event references, map source structure,
  calendar access semantics, and viewport-road coverage calculations.
- [x] Hosted Netlify deploy preview. Nothing merged to the live website.

## Release blockers: editorial accuracy

- [ ] **Venue identity, access and coordinates:** all 83 venue profiles currently
  have `review.status: pending`. All 83 pin positions are marked `approximate`.
  For each institution, independently check organization identity, official
  visitor-access guidance, exact public-facing address and map placement. Research
  campuses are not public-access laboratory locations. Review checks must be
  recorded in `static/atlas/data/places.json`.
- [ ] **Exact entrances:** do not equate a city or campus centroid with a visitor
  entrance. Use authoritative venue visitor maps/address pages when possible;
  preserve uncertainty until confirmed.
- [ ] **Events and cancellations:** the 43 occurrences are starter content, not
  live-confirmed ticket inventories. Recheck dates, fees, age restrictions,
  eligibility, registration, cancellations and sold-out statuses against official
  sources. Multiple camp days may share one registration.
- [ ] **Coverage:** balance museum programming with public university seminars,
  observatory sessions, science outreach, environmental education and workshops
  across Texas. Carefully distinguish public events from student-only events.
- [ ] **Source and map licensing:** verify redistributable provenance for county
  and TxDOT basemap-derived geometry before production. Credit Census TIGERweb
  live road data. Review remote-service usage constraints and terms.
- [ ] **Maintenance:** confirm a documented editor approval process before
  anything updates the published site. The existing weekly Science Atlas research
  automation supplies review candidates; it is **not** a live web importer and
  does not write approved events into GitHub automatically.

## Engineering and accessibility follow-ups

- [ ] Test map touch gestures and deep zoom in Safari and Chrome on real mobile
  devices; confirm long network waits and loss of connectivity are understandable.
- [ ] Audit city/street label legibility, keyboard navigation, zoom focus, screen
  reader semantics and high-contrast mode.
- [ ] Confirm network/fetch performance, rate-limit strategy and fallbacks if
  TIGERweb is slow or unreachable (the core county and TxDOT display stays
  embedded without live street requests).
- [ ] Review all outbound links, duplicate locations, geographic accuracy and
  institutional status/closure updates.
- [ ] Align with Frameworked navigation, typography and no-emoji iconography.
  Confirm link paths and asset permissions before integrating into the main site.
- [ ] Formalize program vs occurrence relationships and better recurring-event
  display so multi-day camps do not overwhelm the calendar.

## Proposed pilot release gate (not yet agreed)

1. Editorially sign off a *defined DFW pilot subset* of venues including accurate
   public coordinates and visitor instructions. Do not claim all 83 are vetted.
2. Review all events shown publicly for the immediate 30-day calendar window;
   restricted programs must carry explicit eligibility notices.
3. Test desktop, mobile, map reset, pan/zoom, road-service failures, all filter
   combinations and event calendar exports.
4. Make source attributions and geodata redistribution rights explicit.
5. Inspect the Netlify preview together and approve the merge only after
   these checks pass.

## Contributor workflow

1. Edit `static/atlas/data/places.json` or `events.json`; maintain official URLs
   and review evidence in each record. Update `dfw-primary-roads.json` only from a
   permitted and documented GIS source.
2. Run `python3 scripts/atlas/sync_events.py`, then
   `python3 scripts/atlas/sync_events.py --check`.
3. Run `node scripts/atlas/audit_places.mjs` and
   `node scripts/atlas/test_calendar_access.mjs`.
4. Review the Netlify deploy preview for actual rendering, touch interaction and
   source citations; keep PR #16 as a draft until approved.

**Evidence gap—assumption applied.** The pilot-release threshold should be
decided together. Currently working map and calendar software does not mean
the scientific institutions, public access, or tickets have been verified.
