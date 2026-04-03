from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any


DEFAULT_RESUME_SECTION_ORDER = [
    "summary",
    "education",
    "skills",
    "experience",
    "projects",
    "certifications",
    "leadership",
    "achievements",
    "competitions",
    "extracurricular",
    "publications",
    "openSource",
    "languages",
    "hobbies",
]


DEFAULT_RENDER_OPTIONS = {
    "accentColor": "charcoal",
    "fontFamily": "TeX Gyre Termes",
    "templateId": "template1",
    "fontSize": 11,
    "lineSpacing": 1.15,
    "maxBulletsPerEntry": 4,
    "margin": "1cm",
    "pageLimit": 1,
    "sectionOrder": list(DEFAULT_RESUME_SECTION_ORDER),
    "sectionTitles": {},
}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_empty_link_field() -> dict[str, Any]:
    return {"displayMode": "plain-url", "displayText": "", "url": ""}


def create_empty_date_field(mode: str = "mm-yyyy-range") -> dict[str, Any]:
    return {
        "endMonth": "",
        "endYear": "",
        "isOngoing": mode.endswith("present"),
        "mode": mode,
        "startMonth": "",
        "startYear": "",
    }


def create_empty_description_field(mode: str = "bullets") -> dict[str, Any]:
    return {"bullets": [], "mode": mode, "paragraph": ""}


def create_empty_custom_entry() -> dict[str, Any]:
    return {
        "date": create_empty_date_field("mm-yyyy"),
        "description": create_empty_description_field("bullets"),
        "link": create_empty_link_field(),
        "location": "",
        "subtitle": "",
        "title": "",
    }


def create_empty_custom_section(label: str) -> dict[str, Any]:
    return {"entries": [], "label": label}


def create_empty_dynamic_section(section_id: str, label: str = "Custom Section") -> dict[str, Any]:
    return {"entries": [], "id": section_id, "label": label}


def create_empty_resume_data(source: str = "scratch") -> dict[str, Any]:
    now = iso_now()
    return {
        "achievements": create_empty_custom_section("Achievements"),
        "certifications": [],
        "competitions": create_empty_custom_section("Competitions"),
        "customSections": [],
        "education": [],
        "experience": [],
        "extracurricular": create_empty_custom_section("Extra-Curricular"),
        "header": {
            "address": "",
            "email": "",
            "github": create_empty_link_field(),
            "linkedin": create_empty_link_field(),
            "name": "",
            "phone": "",
            "role": "",
            "website": create_empty_link_field(),
        },
        "hobbies": {"groups": [], "items": [], "mode": "csv"},
        "languages": {"groups": [], "items": [], "mode": "csv"},
        "leadership": create_empty_custom_section("Leadership"),
        "meta": {
            "createdAt": now,
            "source": source,
            "updatedAt": now,
            "version": "2.0",
        },
        "openSource": create_empty_custom_section("Open-Source"),
        "projects": [],
        "publications": create_empty_custom_section("Publications"),
        "skills": {"groups": [], "items": [], "mode": "csv"},
        "summary": {"content": "", "mode": "professional-summary"},
    }


def clone_render_options() -> dict[str, Any]:
    return deepcopy(DEFAULT_RENDER_OPTIONS)
