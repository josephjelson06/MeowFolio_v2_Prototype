from __future__ import annotations

from typing import Any

from .contracts import (
    clone_render_options,
    create_empty_custom_entry,
    create_empty_custom_section,
    create_empty_date_field,
    create_empty_description_field,
    create_empty_dynamic_section,
    create_empty_link_field,
    create_empty_resume_data,
)


def is_record(value: Any) -> bool:
    return isinstance(value, dict)


def string_value(value: Any, fallback: str = "") -> str:
    return value if isinstance(value, str) else fallback


def string_array(value: Any) -> list[str]:
    return [item for item in [string_value(entry) for entry in value] if item] if isinstance(value, list) else []


def month_value(value: Any) -> str:
    return value if isinstance(value, str) and len(value) == 3 else ""


def normalize_link_field(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return create_empty_link_field()
    return {
        "displayMode": "hyperlinked-text" if value.get("displayMode") == "hyperlinked-text" else "plain-url",
        "displayText": string_value(value.get("displayText")),
        "url": string_value(value.get("url")),
    }


def normalize_date_field(value: Any, fallback_mode: str = "mm-yyyy-range") -> dict[str, Any]:
    if not is_record(value):
        return create_empty_date_field(fallback_mode)
    mode = string_value(value.get("mode"), fallback_mode) or fallback_mode
    return {
        "endMonth": month_value(value.get("endMonth")),
        "endYear": string_value(value.get("endYear")),
        "isOngoing": bool(value.get("isOngoing")),
        "mode": mode,
        "startMonth": month_value(value.get("startMonth")),
        "startYear": string_value(value.get("startYear")),
    }


def normalize_description_field(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return create_empty_description_field("bullets")
    mode = "paragraph" if value.get("mode") == "paragraph" else "bullets"
    return {
        "bullets": string_array(value.get("bullets")),
        "mode": mode,
        "paragraph": string_value(value.get("paragraph")),
    }


def normalize_summary(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return {"content": "", "mode": "professional-summary"}
    return {
        "content": string_value(value.get("content")),
        "mode": "career-objective" if value.get("mode") == "career-objective" else "professional-summary",
    }


def normalize_education_entry(value: Any) -> dict[str, Any]:
    return {
        "boardOrUniversity": string_value(value.get("boardOrUniversity")) if is_record(value) else "",
        "date": normalize_date_field(value.get("date"), "yyyy-range") if is_record(value) else create_empty_date_field("yyyy-range"),
        "degree": string_value(value.get("degree")) if is_record(value) else "",
        "field": string_value(value.get("field")) if is_record(value) else "",
        "institution": string_value(value.get("institution")) if is_record(value) else "",
        "level": string_value(value.get("level"), "degree-diploma") if is_record(value) else "degree-diploma",
        "location": string_value(value.get("location")) if is_record(value) else "",
        "result": string_value(value.get("result")) if is_record(value) else "",
        "resultType": value.get("resultType") if is_record(value) and isinstance(value.get("resultType"), str) else None,
    }


def normalize_skills_section(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return {"groups": [], "items": [], "mode": "csv"}
    groups = []
    for group in value.get("groups", []):
        if is_record(group):
            groups.append({
                "groupLabel": string_value(group.get("groupLabel")),
                "items": string_array(group.get("items")),
            })
    return {
        "groups": groups,
        "items": string_array(value.get("items")),
        "mode": "grouped" if value.get("mode") == "grouped" else "csv",
    }


def normalize_experience_entry(value: Any) -> dict[str, Any]:
    return {
        "company": string_value(value.get("company")) if is_record(value) else "",
        "date": normalize_date_field(value.get("date"), "mm-yyyy-range") if is_record(value) else create_empty_date_field("mm-yyyy-range"),
        "description": normalize_description_field(value.get("description")) if is_record(value) else create_empty_description_field("bullets"),
        "isCurrent": bool(value.get("isCurrent")) if is_record(value) else False,
        "location": string_value(value.get("location")) if is_record(value) else "",
        "role": string_value(value.get("role")) if is_record(value) else "",
    }


def normalize_project_entry(value: Any) -> dict[str, Any]:
    return {
        "date": normalize_date_field(value.get("date"), "mm-yyyy-range") if is_record(value) else create_empty_date_field("mm-yyyy-range"),
        "description": normalize_description_field(value.get("description")) if is_record(value) else create_empty_description_field("bullets"),
        "githubLink": normalize_link_field(value.get("githubLink")) if is_record(value) else create_empty_link_field(),
        "liveLink": normalize_link_field(value.get("liveLink")) if is_record(value) else create_empty_link_field(),
        "technologies": string_array(value.get("technologies")) if is_record(value) else [],
        "title": string_value(value.get("title")) if is_record(value) else "",
    }


def normalize_certification_entry(value: Any) -> dict[str, Any]:
    return {
        "date": normalize_date_field(value.get("date"), "yyyy") if is_record(value) else create_empty_date_field("yyyy"),
        "description": string_value(value.get("description")) if is_record(value) else "",
        "issuer": string_value(value.get("issuer")) if is_record(value) else "",
        "link": normalize_link_field(value.get("link")) if is_record(value) else create_empty_link_field(),
        "title": string_value(value.get("title")) if is_record(value) else "",
    }


def _normalize_custom_entries(entries_value: Any) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    if isinstance(entries_value, list):
        for entry in entries_value:
            if is_record(entry):
                next_entry = create_empty_custom_entry()
                next_entry.update({
                    "date": normalize_date_field(entry.get("date"), "mm-yyyy"),
                    "description": normalize_description_field(entry.get("description")),
                    "link": normalize_link_field(entry.get("link")),
                    "location": string_value(entry.get("location")),
                    "subtitle": string_value(entry.get("subtitle")),
                    "title": string_value(entry.get("title")),
                })
                entries.append(next_entry)
    return entries


def normalize_custom_section(value: Any, fallback_label: str) -> dict[str, Any]:
    base = create_empty_custom_section(fallback_label)
    if not is_record(value):
        return base
    return {
        "entries": _normalize_custom_entries(value.get("entries")),
        "label": string_value(value.get("label"), fallback_label),
    }


def normalize_dynamic_sections(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    sections = []
    for index, section in enumerate(value):
        if not is_record(section):
            continue
        next_section = create_empty_dynamic_section(
            string_value(section.get("id"), f"custom_{index + 1}"),
            string_value(section.get("label"), f"Custom Section {index + 1}"),
        )
        next_section["entries"] = _normalize_custom_entries(section.get("entries"))
        sections.append(next_section)
    return sections


def normalize_languages(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return {"groups": [], "items": [], "mode": "csv"}
    groups = []
    for group in value.get("groups", []):
        if is_record(group):
            groups.append({"groupLabel": string_value(group.get("groupLabel")), "items": string_array(group.get("items"))})
    items = []
    for item in value.get("items", []):
        if is_record(item):
            items.append({
                "language": string_value(item.get("language")),
                "proficiency": item.get("proficiency") if isinstance(item.get("proficiency"), str) else None,
            })
    return {
        "groups": groups,
        "items": items,
        "mode": "grouped" if value.get("mode") == "grouped" else "csv",
    }


def normalize_hobbies(value: Any) -> dict[str, Any]:
    if not is_record(value):
        return {"groups": [], "items": [], "mode": "csv"}
    groups = []
    for group in value.get("groups", []):
        if is_record(group):
            groups.append({"groupLabel": string_value(group.get("groupLabel")), "items": string_array(group.get("items"))})
    return {
        "groups": groups,
        "items": string_array(value.get("items")),
        "mode": "grouped" if value.get("mode") == "grouped" else "csv",
    }


def normalize_render_options(value: Any) -> dict[str, Any]:
    base = clone_render_options()
    if not is_record(value):
        return base
    return {
        "accentColor": string_value(value.get("accentColor"), base["accentColor"]),
        "fontFamily": string_value(value.get("fontFamily"), base["fontFamily"]),
        "fontSize": value.get("fontSize") if isinstance(value.get("fontSize"), (int, float)) else base["fontSize"],
        "lineSpacing": value.get("lineSpacing") if isinstance(value.get("lineSpacing"), (int, float)) else base["lineSpacing"],
        "margin": string_value(value.get("margin"), base["margin"]),
        "maxBulletsPerEntry": value.get("maxBulletsPerEntry") if isinstance(value.get("maxBulletsPerEntry"), int) else base["maxBulletsPerEntry"],
        "pageLimit": 2 if value.get("pageLimit") == 2 else 1,
        "sectionOrder": [item for item in [string_value(entry) for entry in value.get("sectionOrder", [])] if item] if isinstance(value.get("sectionOrder"), list) else list(base["sectionOrder"]),
        "sectionTitles": {str(key): string_value(item) for key, item in value.get("sectionTitles", {}).items()} if is_record(value.get("sectionTitles")) else dict(base["sectionTitles"]),
        "templateId": string_value(value.get("templateId"), base["templateId"]),
    }


def normalize_resume_data(value: Any, source: str = "scratch") -> dict[str, Any]:
    base = create_empty_resume_data(source)
    if not is_record(value):
        return base

    header = value.get("header") if is_record(value.get("header")) else {}
    meta = value.get("meta") if is_record(value.get("meta")) else {}

    return {
        "achievements": normalize_custom_section(value.get("achievements"), "Achievements"),
        "certifications": [normalize_certification_entry(item) for item in value.get("certifications", [])] if isinstance(value.get("certifications"), list) else [],
        "competitions": normalize_custom_section(value.get("competitions"), "Competitions"),
        "customSections": normalize_dynamic_sections(value.get("customSections")),
        "education": [normalize_education_entry(item) for item in value.get("education", [])] if isinstance(value.get("education"), list) else [],
        "experience": [normalize_experience_entry(item) for item in value.get("experience", [])] if isinstance(value.get("experience"), list) else [],
        "extracurricular": normalize_custom_section(value.get("extracurricular"), "Extra-Curricular"),
        "header": {
            "address": string_value(header.get("address")),
            "email": string_value(header.get("email")),
            "github": normalize_link_field(header.get("github")),
            "linkedin": normalize_link_field(header.get("linkedin")),
            "name": string_value(header.get("name")),
            "phone": string_value(header.get("phone")),
            "role": string_value(header.get("role")),
            "website": normalize_link_field(header.get("website")),
        },
        "hobbies": normalize_hobbies(value.get("hobbies")),
        "languages": normalize_languages(value.get("languages")),
        "leadership": normalize_custom_section(value.get("leadership"), "Leadership"),
        "meta": {
            "createdAt": string_value(meta.get("createdAt"), base["meta"]["createdAt"]),
            "source": source,
            "updatedAt": create_empty_resume_data(source)["meta"]["updatedAt"],
            "version": string_value(meta.get("version"), base["meta"]["version"]),
        },
        "openSource": normalize_custom_section(value.get("openSource"), "Open-Source"),
        "projects": [normalize_project_entry(item) for item in value.get("projects", [])] if isinstance(value.get("projects"), list) else [],
        "publications": normalize_custom_section(value.get("publications"), "Publications"),
        "skills": normalize_skills_section(value.get("skills")),
        "summary": normalize_summary(value.get("summary")),
    }


def build_resume_plain_text(resume: dict[str, Any]) -> str:
    parts: list[str] = []

    def push(*items: Any) -> None:
        text = " ".join(str(item).strip() for item in items if item).strip()
        if text:
            parts.append(text)

    header = resume.get("header", {})
    push(header.get("name"), header.get("role"), header.get("email"), header.get("phone"), header.get("address"))
    push(resume.get("summary", {}).get("content"))

    for item in resume.get("education", []):
        push(item.get("degree"), item.get("field"), item.get("institution"), item.get("boardOrUniversity"), item.get("result"))

    push(" ".join(resume.get("skills", {}).get("items", [])))
    for group in resume.get("skills", {}).get("groups", []):
        push(group.get("groupLabel"), " ".join(group.get("items", [])))

    for item in resume.get("experience", []):
        description = item.get("description", {})
        push(item.get("role"), item.get("company"), item.get("location"), " ".join(description.get("bullets", [])), description.get("paragraph"))

    for item in resume.get("projects", []):
        description = item.get("description", {})
        push(item.get("title"), " ".join(item.get("technologies", [])), " ".join(description.get("bullets", [])), description.get("paragraph"))

    for item in resume.get("certifications", []):
        push(item.get("title"), item.get("issuer"), item.get("description"))

    for section in [
        resume.get("leadership", {}),
        resume.get("achievements", {}),
        resume.get("competitions", {}),
        resume.get("extracurricular", {}),
        resume.get("publications", {}),
        resume.get("openSource", {}),
        *resume.get("customSections", []),
    ]:
        push(section.get("label"))
        for entry in section.get("entries", []):
            description = entry.get("description", {})
            push(entry.get("title"), entry.get("subtitle"), entry.get("location"), " ".join(description.get("bullets", [])), description.get("paragraph"))

    for item in resume.get("languages", {}).get("items", []):
        push(item.get("language"), item.get("proficiency"))

    push(" ".join(resume.get("hobbies", {}).get("items", [])))
    return "\n".join(parts)

