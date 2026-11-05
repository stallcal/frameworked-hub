#!/usr/bin/env python3
"""Validate Atlas calendar records and sync the embedded offline-safe HTML data.

Run:
  python3 scripts/atlas/sync_events.py --check
  python3 scripts/atlas/sync_events.py
This command never fetches, discovers, or publishes external event information.
"""
import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
CALENDAR = ROOT / "static/atlas/data/events.json"
HTML = ROOT / "static/atlas/index.html"
EMBED = re.compile(r"(?m)^const EVENTS=(.*)\.events;$")
PLACE_DATA = re.compile(r"(?m)^const DATA=(.*);$")
ALLOWED_ACCESS = {"public", "registration", "restricted"}
ALLOWED_CATEGORY = {
    "nature", "environment", "workshop", "science_social",
    "creative_science", "family", "astronomy", "lecture", "camp", "other",
}
CENTRAL = ZoneInfo("America/Chicago")


def validate(doc, html):
    assert doc["publication_status"] == "preview_only_editorial_review_required", (
        "Source review alone is not publication approval"
    )
    places_match = PLACE_DATA.search(html)
    if not places_match:
        raise ValueError("Embedded places dataset not found")
    places = {p["id"] for p in json.loads(places_match.group(1))["places"]}
    ids = set()
    unique_occurrences = set()
    for event in doc["events"]:
        event_id = event["id"]
        if event_id in ids:
            raise ValueError(f"Duplicate event ID: {event_id}")
        ids.add(event_id)
        if event["institution_id"] not in places:
            raise ValueError(f"Unknown institution for {event_id}")
        if event["category"] not in ALLOWED_CATEGORY:
            raise ValueError(f"Unknown category for {event_id}")
        if event["access"] not in ALLOWED_ACCESS:
            raise ValueError(f"Invalid public-access classification for {event_id}")
        if event["timezone"] != "America/Chicago":
            raise ValueError(f"Unrecognized event timezone for {event_id}")
        if not event["source_url"].startswith("https://"):
            raise ValueError(f"Official source must be HTTPS: {event_id}")
        if event["review"]["status"] not in ("source_checked", "approved"):
            raise ValueError(f"Unreviewed event status: {event_id}")
        datetime.fromisoformat(event["source_checked_at"])
        start = datetime.fromisoformat(event["start_at"])
        if start.tzinfo is None or start.utcoffset() != start.astimezone(CENTRAL).utcoffset():
            raise ValueError(f"Start time lacks correct Texas UTC offset: {event_id}")
        if event.get("end_at"):
            end = datetime.fromisoformat(event["end_at"])
            if end <= start:
                raise ValueError(f"End at/before start: {event_id}")
            if end.utcoffset() != end.astimezone(CENTRAL).utcoffset():
                raise ValueError(f"End time lacks correct Texas UTC offset: {event_id}")
        occurrence = (event["institution_id"], event["title"], event["start_at"])
        if occurrence in unique_occurrences:
            raise ValueError(f"Duplicate institution/title/start: {event_id}")
        unique_occurrences.add(occurrence)
    return len(places), Counter(e["start_at"][:7] for e in doc["events"])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="Fail if HTML's embedded event data differs from events.json")
    args = parser.parse_args()
    doc = json.loads(CALENDAR.read_text(encoding="utf-8"))
    html = HTML.read_text(encoding="utf-8")
    places, counts = validate(doc, html)
    match = EMBED.search(html)
    if not match:
        raise SystemExit("Cannot find inline Atlas event dataset")
    target = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    current = json.loads(match.group(1))
    if args.check:
        if current != doc:
            raise SystemExit("Atlas calendar is out of sync; run sync_events.py and commit the HTML")
    else:
        updated = html[:match.start(1)] + target + html[match.end(1):]
        if updated != html:
            HTML.write_text(updated, encoding="utf-8")
            print("Rebuilt embedded calendar from events.json")
    print(f"Atlas events valid: {len(doc['events'])} occurrences, {places} institutions")
    print("Months:", dict(sorted(counts.items())))
    print("Source-checked does NOT mean editorially approved or ticket-available.")


if __name__ == "__main__":
    main()
