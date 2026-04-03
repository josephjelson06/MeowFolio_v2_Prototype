from __future__ import annotations

from datetime import datetime, timezone
import re


def _to_datetime(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value
    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def format_relative_time(value: str | datetime) -> str:
    timestamp = _to_datetime(value)
    diff = datetime.now(timezone.utc) - timestamp.astimezone(timezone.utc)
    total_seconds = max(int(diff.total_seconds()), 0)

    minute = 60
    hour = 60 * minute
    day = 24 * hour
    week = 7 * day
    month = 30 * day

    if total_seconds < hour:
        minutes = max(1, round(total_seconds / minute))
        return f"{minutes}m ago"
    if total_seconds < day:
        hours = max(1, round(total_seconds / hour))
        return f"{hours}h ago"
    if total_seconds < 2 * day:
        return "yesterday"
    if total_seconds < week:
        days = max(1, round(total_seconds / day))
        return f"{days}d ago"
    if total_seconds < month:
        weeks = max(1, round(total_seconds / week))
        return f"{weeks}w ago"
    months = max(1, round(total_seconds / month))
    return f"{months}mo ago"


def slugify(value: str) -> str:
    return re.sub(r"^_+|_+$", "", re.sub(r"[^a-z0-9]+", "_", value.lower()))[:48]

