from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Any

from .app_config import PATHS


def _preview_image(relative_file: str) -> str:
    return f"/static/templates/{relative_file}"


def _tsx_runtime_path() -> Path:
    if os.name == "nt":
        return PATHS.backend_root / "node_modules" / ".bin" / "tsx.cmd"
    return PATHS.backend_root / "node_modules" / ".bin" / "tsx"


def _tex_bridge_script_path() -> Path:
    return PATHS.backend_root / "tex_bridge" / "render_resume.ts"


def _tex_bridge_available() -> bool:
    return _tsx_runtime_path().exists() and _tex_bridge_script_path().exists()


TEX_BRIDGE_AVAILABLE = _tex_bridge_available()

TEMPLATE_REGISTRY = [
    {"id": "template1", "name": "Classic", "badge": "Template 1", "bestFor": "ATS-friendly technical resumes with clear section rhythm", "density": "balanced", "description": "Centered identity block with ruled sections and clean multi-page flow.", "headerLayout": "center", "previewImageUrl": _preview_image("Temp1.jpg"), "sectionStyle": "rule", "availableForCompile": False},
    {"id": "template2", "name": "Sidebar", "badge": "Template 2", "bestFor": "Classic software-engineering resumes with compact ATS structure", "density": "tight", "description": "Compact single-column technical layout with strong scanability.", "headerLayout": "center", "previewImageUrl": _preview_image("Temp2.jpg"), "sectionStyle": "rule", "availableForCompile": False},
    {"id": "template3", "name": "Structured", "badge": "Template 3", "bestFor": "Student and early-career resumes with coursework and projects", "density": "balanced", "description": "Jake-style resume layout with dense but readable section rhythm.", "headerLayout": "center", "previewImageUrl": _preview_image("Temp5.jpg"), "sectionStyle": "underline", "availableForCompile": False},
    {"id": "template4", "name": "Minimal", "badge": "Template 4", "bestFor": "Low-chrome resumes that still preserve hierarchy", "density": "airy", "description": "Lean visual treatment with lighter section chrome and wider breathing room.", "headerLayout": "left", "previewImageUrl": _preview_image("Temp6.png"), "sectionStyle": "capsule", "availableForCompile": False},
    {"id": "template5", "name": "Bold", "badge": "Template 5", "bestFor": "Application versions that need slightly stronger visual presence", "density": "balanced", "description": "A more expressive layout with a confident section treatment and compact flow.", "headerLayout": "left", "previewImageUrl": _preview_image("Temp7.png"), "sectionStyle": "capsule", "availableForCompile": False},
]


def get_template_runtime_meta() -> dict[str, Any]:
    return {
        "compileEnabled": False,
        "compilerImage": bool(PATHS.tex_templates_dir),
        "texBridgeAvailable": TEX_BRIDGE_AVAILABLE,
        "texRenderEnabled": True,
        "texSourceAvailable": True,
    }


def _escape_tex(value: str) -> str:
    replacements = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}"}
    return "".join(replacements.get(char, char) for char in value)


def _render_section(title: str, lines: list[str]) -> str:
    if not lines:
        return ""
    body = "\n".join(rf"\item {_escape_tex(line)}" for line in lines if line.strip())
    if not body:
        return ""
    return "\n".join([rf"\section*{{{_escape_tex(title)}}}", r"\begin{itemize}[leftmargin=*,itemsep=0.35em]", body, r"\end{itemize}", ""])


def _fallback_render_resume_to_tex(resume: dict[str, Any], options: dict[str, Any]) -> str:
    header = resume.get("header", {})
    summary = resume.get("summary", {})
    education_lines = [" | ".join(filter(None, [item.get("degree"), item.get("field"), item.get("institution"), item.get("boardOrUniversity"), item.get("result")])) for item in resume.get("education", [])]
    skill_lines = []
    if resume.get("skills", {}).get("items"):
        skill_lines.append(", ".join(resume["skills"]["items"]))
    for group in resume.get("skills", {}).get("groups", []):
        skill_lines.append(f"{group.get('groupLabel')}: {', '.join(group.get('items', []))}")
    experience_lines = []
    for item in resume.get("experience", []):
        description = item.get("description", {})
        bullets = description.get("bullets", []) or ([description.get("paragraph")] if description.get("paragraph") else [])
        experience_lines.append(" | ".join(filter(None, [item.get("role"), item.get("company"), item.get("location"), " ".join(filter(None, bullets))])))
    project_lines = []
    for item in resume.get("projects", []):
        description = item.get("description", {})
        bullets = description.get("bullets", []) or ([description.get("paragraph")] if description.get("paragraph") else [])
        project_lines.append(" | ".join(filter(None, [item.get("title"), ", ".join(item.get("technologies", [])), " ".join(filter(None, bullets))])))

    name = _escape_tex(header.get("name") or "Untitled Resume")
    role = _escape_tex(header.get("role") or "")
    contact_parts = [_escape_tex(value) for value in [header.get("email"), header.get("phone"), header.get("address")] if value]
    summary_text = summary.get("content") or ""

    sections = "".join([
        _render_section("Summary", [summary_text] if summary_text else []),
        _render_section("Education", education_lines),
        _render_section("Skills", skill_lines),
        _render_section("Experience", experience_lines),
        _render_section("Projects", project_lines),
    ])

    return "\n".join([
        r"\documentclass[11pt]{article}",
        r"\usepackage[margin=1in]{geometry}",
        r"\usepackage{enumitem}",
        r"\usepackage[T1]{fontenc}",
        r"\begin{document}",
        rf"\begin{{center}}\LARGE\textbf{{{name}}}\\[0.35em]",
        rf"\large {role}\\[0.25em]" if role else "",
        _escape_tex(" | ".join(contact_parts)) if contact_parts else "",
        r"\end{center}",
        "",
        rf"% templateId: {options.get('templateId', 'template1')}",
        sections,
        r"\end{document}",
    ])


def _normalize_filename(title: str) -> str:
    trimmed = title.strip()
    if not trimmed:
        return "resume.tex"
    return trimmed if trimmed.lower().endswith(".tex") else f"{trimmed}.tex"


def _build_fallback_tex_payload(title: str, resume: dict[str, Any], render_options: dict[str, Any]) -> dict[str, Any]:
    return {
        "filename": _normalize_filename(title),
        "templateId": render_options.get("templateId", "template1"),
        "tex": _fallback_render_resume_to_tex(resume, render_options),
    }


def _render_tex_via_bridge(title: str, resume: dict[str, Any], render_options: dict[str, Any]) -> dict[str, Any]:
    payload = {"title": title, "resume": resume, "renderOptions": render_options}
    completed = subprocess.run(
        [str(_tsx_runtime_path()), str(_tex_bridge_script_path())],
        capture_output=True,
        check=True,
        cwd=str(PATHS.project_root),
        input=json.dumps(payload),
        text=True,
        timeout=30,
    )
    response = json.loads(completed.stdout)
    if not isinstance(response, dict) or not isinstance(response.get("tex"), str):
        raise RuntimeError("Template bridge returned an invalid payload.")
    return {
        "filename": response.get("filename") or _normalize_filename(title),
        "templateId": response.get("templateId") or render_options.get("templateId", "template1"),
        "tex": response["tex"],
    }


def build_tex_export_payload(title: str, resume: dict[str, Any], render_options: dict[str, Any]) -> dict[str, Any]:
    if TEX_BRIDGE_AVAILABLE:
        try:
            return _render_tex_via_bridge(title, resume, render_options)
        except (subprocess.SubprocessError, json.JSONDecodeError, OSError, RuntimeError):
            pass

    return _build_fallback_tex_payload(title, resume, render_options)
