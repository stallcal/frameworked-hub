#!/usr/bin/env python3
"""Validate and synchronize editable Frameworked Science Atlas source datasets.

Sources of truth:
  static/atlas/data/places.json
  static/atlas/data/events.json
  static/atlas/data/dfw-primary-roads.json

Run from repo root:
  python3 scripts/atlas/sync_events.py --check
  python3 scripts/atlas/sync_events.py

The HTML is self-contained for offline mapping. This tool does not fetch remote
information, approve editorial records, or publish any changes.
"""
import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[2]
HTML = ROOT / "static/atlas/index.html"
SOURCES = {
    "DATA": (ROOT / "static/atlas/data/places.json", re.compile(r"(?m)^const DATA=(.*);$")),
    "ROADS": (ROOT / "static/atlas/data/dfw-primary-roads.json", re.compile(r"(?m)^const ROADS=(.*);$")),
    "EVENTS": (ROOT / "static/atlas/data/events.json", re.compile(r"(?m)^const EVENTS=(.*)\.events;$")),
}
ALLOWED_ACCESS = {"public", "registration", "restricted"}
ALLOWED_CATEGORY = {
    "nature", "environment", "workshop", "science_social",
    "creative_science", "family", "astronomy", "lecture", "camp", "other",
}
CENTRAL = ZoneInfo("America/Chicago")


def validate(sources):
    places = sources["DATA"]["places"]
    events_doc = sources["EVENTS"]
    events = events_doc["events"]
    roads = sources["ROADS"]
    assert events_doc["publication_status"] == "preview_only_editorial_review_required", (
        "Source checks alone cannot approve public event publication"
    )
    ids = set()
    for p in places:
        pid = p["id"]
        if pid in ids:
            raise ValueError("Duplicate institution ID: " + pid)
        ids.add(pid)
        if not p["links"]["official_url"].startswith("https://"):
            raise ValueError("Institution missing HTTPS official source: " + pid)
        if p["review"]["status"] not in {"pending", "verified"}:
            raise ValueError("Unrecognized editorial review status: " + pid)
        if p["review"]["status"] == "verified":
            checks = p["review"]["checks"]
            if not all(checks.get(k) for k in
                       ("organization_source", "access_source", "coordinate_source")):
                raise ValueError("Verified institution lacks required checks: " + pid)
        lat, lng = p["coordinates"]["lat"], p["coordinates"]["lng"]
        if not (25 <= lat <= 37 and -107 <= lng <= -93):
            raise ValueError("Location outside broad Texas bounds: " + pid)
    events_seen = set()
    occurrences = set()
    for e in events:
        eid = e["id"]
        if eid in events_seen:
            raise ValueError("Duplicate event ID: " + eid)
        events_seen.add(eid)
        if e["institution_id"] not in ids:
            raise ValueError("Unknown institution for " + eid)
        if e["category"] not in ALLOWED_CATEGORY:
            raise ValueError("Unknown category for " + eid)
        if e["access"] not in ALLOWED_ACCESS:
            raise ValueError("Invalid event access for " + eid)
        if e["timezone"] != "America/Chicago":
            raise ValueError("Invalid timezone for " + eid)
        if not e["source_url"].startswith("https://"):
            raise ValueError("Event missing primary source for " + eid)
        if e["review"]["status"] not in ("source_checked", "approved"):
            raise ValueError("Invalid event review status for " + eid)
        datetime.fromisoformat(e["source_checked_at"])
        start = datetime.fromisoformat(e["start_at"])
        if start.tzinfo is None or start.utcoffset() != start.astimezone(CENTRAL).utcoffset():
            raise ValueError("Invalid Texas UTC offset for " + eid)
        if e.get("end_at"):
            end = datetime.fromisoformat(e["end_at"])
            if end <= start or end.utcoffset() != end.astimezone(CENTRAL).utcoffset():
                raise ValueError("Invalid event end time for " + eid)
        occurrence = e["institution_id"], e["title"], e["start_at"]
        if occurrence in occurrences:
            raise ValueError("Duplicate institution/title/time event for " + eid)
        occurrences.add(occurrence)
    if not roads["source_url"].startswith("https://") or not roads["roads"]:
        raise ValueError("Roads source or content missing")
    seen_routes = set()
    for route in roads["roads"]:
        if route["name"] in seen_routes:
            raise ValueError("Duplicate road identifier: " + route["name"])
        seen_routes.add(route["name"])
        if route["level"] not in ("primary", "secondary") or not route["d"].startswith("M"):
            raise ValueError("Invalid road line geometry for " + route["name"])
    return len(places), len(events), len(roads["roads"]), Counter(e["start_at"][:7] for e in events)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="Fail when Atlas inline data differs from canonical JSON files")
    args = parser.parse_args()
    datasets = {name: json.loads(path.read_text(encoding="utf-8"))
                for name, (path, _) in SOURCES.items()}
    places, events, routes, months = validate(datasets)
    html = HTML.read_text(encoding="utf-8")
    for name, (_, regex) in SOURCES.items():
        match = regex.search(html)
        if not match:
            raise SystemExit("Cannot find embedded Atlas dataset: " + name)
        current = json.loads(match.group(1))
        if args.check:
            if current != datasets[name]:
                raise SystemExit(name + " is out of sync: run sync_events.py and commit index.html")
        else:
            compact = json.dumps(datasets[name], ensure_ascii=False, separators=(",", ":"))
            html = html[:match.start(1)] + compact + html[match.end(1):]
    if not args.check:
        original = HTML.read_text(encoding="utf-8")
        if html != original:
            HTML.write_text(html, encoding="utf-8")
            print("Rebuilt index.html's three embedded source datasets")
    print(f"Atlas source integrity PASS: {places} institutions, {events} event occurrences, {routes} highway routes")
    print("Calendar months:", dict(sorted(months.items())))
    print("Publication gate: editorial and coordinate review remains mandatory.")


if __name__ == "__main__":
    main()
