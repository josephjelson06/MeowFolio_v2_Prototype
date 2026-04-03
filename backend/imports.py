from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from uuid import uuid4

import httpx
from docx import Document
from pypdf import PdfReader

from .app_config import ENV
from .contracts import clone_render_options, create_empty_description_field, create_empty_link_field, create_empty_resume_data
from .formatters import slugify
from .normalizer import normalize_resume_data

SECTION_ALIASES = [
    ("summary", re.compile(r"^(summary|profile|professional summary|career objective|objective)$", re.I)),
    ("education", re.compile(r"^education$", re.I)),
    ("skills", re.compile(r"^skills?$", re.I)),
    ("experience", re.compile(r"^(experience|work experience|internships?)$", re.I)),
    ("projects", re.compile(r"^projects?$", re.I)),
    ("certifications", re.compile(r"^certifications?$", re.I)),
    ("languages", re.compile(r"^languages?$", re.I)),
    ("hobbies", re.compile(r"^(hobbies|interests|hobbies & interests)$", re.I)),
]

SCHEMA_OVERVIEW = """
{
  "header": {
    "name": null,
    "role": null,
    "phone": null,
    "email": null,
    "address": null,
    "github": { "url": null, "displayMode": "plain-url", "displayText": null },
    "linkedin": { "url": null, "displayMode": "plain-url", "displayText": null },
    "website": { "url": null, "displayMode": "plain-url", "displayText": null }
  },
  "summary": { "mode": "professional-summary", "content": null },
  "education": [],
  "skills": { "mode": "csv", "items": [], "groups": [] },
  "experience": [],
  "projects": [],
  "certifications": [],
  "leadership": { "label": "Leadership", "entries": [] },
  "achievements": { "label": "Achievements", "entries": [] },
  "competitions": { "label": "Competitions", "entries": [] },
  "extracurricular": { "label": "Extra-Curricular", "entries": [] },
  "publications": { "label": "Publications", "entries": [] },
  "openSource": { "label": "Open-Source", "entries": [] },
  "languages": { "mode": "csv", "items": [], "groups": [] },
  "hobbies": { "mode": "csv", "items": [], "groups": [] },
  "customSections": []
}
""".strip()


def build_resume_parse_prompt(raw_text: str) -> dict[str, str]:
    return {
        "system": (
            "You are a structured resume parser.\n"
            "Return only valid JSON.\n"
            "Do not wrap JSON in markdown.\n"
            "Do not add commentary or extra keys.\n"
            "Preserve facts from the source resume only.\n"
            "If data is missing, use null for scalars and [] for arrays.\n"
            "Resume sections can appear in any order.\n\n"
            f"The JSON must match this schema exactly:\n{SCHEMA_OVERVIEW}"
        ),
        "user": f"Parse the following resume text into JSON and return JSON only.\n\nResume text:\n{raw_text}",
    }


def parse_resume_with_groq(raw_text: str) -> dict[str, Any] | None:
    if not ENV.groq_api_key or ENV.ai_provider != "groq":
        return None
    prompt = build_resume_parse_prompt(raw_text)
    response = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {ENV.groq_api_key}", "Content-Type": "application/json"},
        json={
            "model": ENV.groq_model,
            "messages": [{"role": "system", "content": prompt["system"]}, {"role": "user", "content": prompt["user"]}],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        },
        timeout=45.0,
    )
    response.raise_for_status()
    payload = response.json()
    content = (((payload.get("choices") or [{}])[0]).get("message") or {}).get("content", "").strip()
    return json.loads(content) if content else None


def extract_text_from_upload(file_path: Path, original_name: str, mime_type: str) -> str:
    extension = file_path.suffix.lower() or Path(original_name).suffix.lower()
    mime = (mime_type or "").lower()
    if mime == "application/pdf" or extension == ".pdf":
        reader = PdfReader(str(file_path))
        return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    if mime == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or extension == ".docx":
        document = Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
    if mime.startswith("text/") or extension in {".txt", ".md"}:
        return file_path.read_text(encoding="utf-8").strip()
    raise ValueError("Unsupported upload type.")


def _extract_contacts(text: str, resume: dict[str, Any]) -> None:
    email = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I)
    phone = re.search(r"(\+?\d[\d\s()-]{8,}\d)", text)
    github = re.search(r"github\.com\/[^\s]+", text, re.I)
    linkedin = re.search(r"linkedin\.com\/[^\s]+", text, re.I)
    resume["header"]["email"] = email.group(0) if email else ""
    resume["header"]["phone"] = phone.group(0) if phone else ""
    resume["header"]["github"] = {**create_empty_link_field(), "url": github.group(0) if github else ""}
    resume["header"]["linkedin"] = {**create_empty_link_field(), "url": linkedin.group(0) if linkedin else ""}


def _detect_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"intro": []}
    current = "intro"
    for line in lines:
        alias = next((key for key, pattern in SECTION_ALIASES if pattern.search(line)), None)
        if alias:
            current = alias
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)
    return sections


def _parse_skills(lines: list[str], resume: dict[str, Any]) -> None:
    grouped = []
    for line in lines:
        parts = line.split(":")
        if len(parts) >= 2:
            grouped.append({"groupLabel": parts[0].strip(), "items": [item.strip() for item in ":".join(parts[1:]).split(",") if item.strip()]})
    if grouped:
        resume["skills"]["mode"] = "grouped"
        resume["skills"]["groups"] = grouped
    else:
        resume["skills"]["items"] = [item.strip() for item in ",".join(lines).split(",") if item.strip()]


def _parse_simple_bullets(lines: list[str]) -> list[str]:
    return [re.sub(r"^[-*•]\s*", "", line).strip() for line in lines if re.sub(r"^[-*•]\s*", "", line).strip()]


def heuristic_parse_resume_text(raw_text: str) -> tuple[dict[str, Any], list[str]]:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    resume = create_empty_resume_data("upload")
    sections = _detect_sections(lines)
    warnings = ["AI parse unavailable or incomplete, so a heuristic import was used."]
    resume["header"]["name"] = lines[0] if lines else "Imported Resume"
    if len(lines) > 1 and not re.search(r"@|github|linkedin|\+?\d", lines[1]):
        resume["header"]["role"] = lines[1]
    _extract_contacts(raw_text, resume)
    resume["summary"]["content"] = " ".join(sections.get("summary", [])).strip()
    resume["education"] = [{"boardOrUniversity": "", "date": {"endMonth": "", "endYear": "", "isOngoing": False, "mode": "yyyy-range", "startMonth": "", "startYear": ""}, "degree": line, "field": "", "institution": "", "level": "degree-diploma", "location": "", "result": "", "resultType": None} for line in sections.get("education", [])]
    _parse_skills(sections.get("skills", []), resume)
    experience_lines = sections.get("experience", [])
    if experience_lines:
        resume["experience"] = [{
            "company": "",
            "date": {"endMonth": "", "endYear": "", "isOngoing": False, "mode": "mm-yyyy-range", "startMonth": "", "startYear": ""},
            "description": {**create_empty_description_field("bullets"), "bullets": _parse_simple_bullets(experience_lines)},
            "isCurrent": False,
            "location": "",
            "role": re.sub(r"^[-*•]\s*", "", experience_lines[0]),
        }]
    project_lines = sections.get("projects", [])
    if project_lines:
        resume["projects"] = [{
            "date": {"endMonth": "", "endYear": "2025", "isOngoing": False, "mode": "yyyy-range", "startMonth": "", "startYear": "2024"},
            "description": {**create_empty_description_field("bullets"), "bullets": _parse_simple_bullets(project_lines[1:])},
            "githubLink": create_empty_link_field(),
            "liveLink": create_empty_link_field(),
            "technologies": [],
            "title": project_lines[0],
        }]
    resume["certifications"] = [{"date": {"endMonth": "", "endYear": "", "isOngoing": False, "mode": "yyyy", "startMonth": "", "startYear": ""}, "description": "", "issuer": "", "link": create_empty_link_field(), "title": line} for line in sections.get("certifications", [])]
    resume["languages"]["items"] = [{"language": item.split(":")[0].strip() if ":" in item else item, "proficiency": item.split(":")[1].strip().lower() if ":" in item else None} for line in sections.get("languages", []) for item in [part.strip() for part in line.split(",") if part.strip()]]
    resume["hobbies"]["items"] = [item.strip() for line in sections.get("hobbies", []) for item in line.split(",") if item.strip()]
    return resume, warnings


def import_resume_from_text(raw_text: str, source_name: str = "Imported Resume") -> dict[str, Any]:
    trimmed = raw_text.strip()
    title_source = source_name or "resume"
    if not trimmed:
        return {
            "extractedText": "",
            "parseStatus": "failed",
            "renderOptions": clone_render_options(),
            "resume": create_empty_resume_data("upload"),
            "title": f"{slugify(title_source) or f'resume_{str(uuid4())[:6]}'}.tex",
            "warnings": ["No resume text was detected during import."],
        }

    warnings: list[str] = []
    parsed: dict[str, Any] | None = None
    try:
        parsed = parse_resume_with_groq(trimmed)
    except Exception as error:
        warnings.append(str(error))

    if parsed:
        resume = normalize_resume_data(parsed, "upload")
        return {
            "extractedText": trimmed,
            "parseStatus": "partial" if warnings else "parsed",
            "renderOptions": clone_render_options(),
            "resume": resume,
            "title": f"{slugify(title_source or resume['header'].get('name') or 'resume') or f'resume_{str(uuid4())[:6]}'}.tex",
            "warnings": warnings,
        }

    heuristic_resume, heuristic_warnings = heuristic_parse_resume_text(trimmed)
    return {
        "extractedText": trimmed,
        "parseStatus": "partial" if heuristic_warnings else "parsed",
        "renderOptions": clone_render_options(),
        "resume": heuristic_resume,
        "title": f"{slugify(title_source or heuristic_resume['header'].get('name') or 'resume') or f'resume_{str(uuid4())[:6]}'}.tex",
        "warnings": [*warnings, *heuristic_warnings],
    }
