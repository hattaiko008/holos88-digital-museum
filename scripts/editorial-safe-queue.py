#!/usr/bin/env python3
"""HOLOS editorial safe candidate inventory. No AI, no posting, no repository writes."""
import argparse
import datetime as dt
import json
from pathlib import Path

REQUIRED_CHECKS = ("text", "sources", "visuals", "layout", "links")
# These article series have personal-essay/first-person potential and require separate approval.
PERSONAL_MARKERS = ("hachico", "life note", "hachico, here", "from where i")
ROOT = Path(__file__).resolve().parents[1]


def inspect(record, root):
    title = str(record.get("title", ""))
    file = str(record.get("file", ""))
    stage = record.get("stage", "")
    series = str(record.get("series", ""))
    location = str(record.get("location", ""))
    reason = []
    if stage != "approved":
        reason.append("not_approved")
    checks = record.get("checks") or {}
    reason.extend("check_" + check for check in REQUIRED_CHECKS if checks.get(check) is not True)
    if any(m in (title + " " + series + " " + location).lower() for m in PERSONAL_MARKERS):
        reason.append("personal_voice_hold")
    # Only known article route; labels like FEATURE are not validated URLs.
    if "/" in file or not file.endswith(".html") or not location.startswith("/prototype/articles/"):
        reason.append("not_article_route")
    expected = "/prototype/articles/" + file
    if location != expected:
        reason.append("route_mismatch")
    # Reject unsafe or non-article paths before any filesystem read.
    safe_file = bool(file) and file.endswith(".html") and file not in (".", "..") and "/" not in file and "\\\\" not in file and not file.startswith(".")
    if not safe_file:
        reason.append("unsafe_article_file")
    html_file = root / "dist" / "prototype" / "articles" / file if safe_file else None
    if html_file is None or not html_file.is_file():
        reason.append("built_html_missing")
    else:
        html = html_file.read_text(encoding="utf-8")
        canonical = 'https://holos88.com' + expected
        if canonical not in html:
            reason.append("canonical_missing")
    return {
        "id": file.removesuffix(".html"),
        "title": title,
        "stage": stage,
        "route": location if location.startswith("/") else "",
        "decision": "review_candidate" if not reason else "blocked",
        "reasons": reason,
        "release_authorized": False,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve()
    source = root / "content" / "editorial-status.json"
    data = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(data.get("articles"), list):
        raise ValueError("Editorial status has no articles array")
    rows = [inspect(a, root) for a in data["articles"]]
    candidates = [r for r in rows if r["decision"] == "review_candidate"]
    payload = {
        "generated_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": "content/editorial-status.json",
        "scope": "inventory_only_no_publication",
        "personal_essays": "held",
        "ai_images": "prohibited",
        "all_items": len(rows),
        "review_candidate_count": len(candidates),
        "review_candidates": candidates,
        "blocked_count": len(rows) - len(candidates),
        "warnings": [
            "Approval/status are historical records, not proof of present publication state.",
            "Each candidate still requires independent source, image-rights, live URL and duplicate-distribution checks.",
            "This script never sends emails, publishes websites or posts to social networks.",
        ]
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"HOLOS review candidates: {len(candidates)} / {len(rows)}; no publication")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
