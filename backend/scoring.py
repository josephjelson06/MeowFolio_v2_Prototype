from __future__ import annotations

import math
import re
from typing import Any

from .normalizer import build_resume_plain_text

COMMON_SKILLS = [
    "python", "react", "node", "node.js", "rest", "rest api", "apis", "aws", "docker", "postgresql",
    "kubernetes", "sql", "typescript", "javascript", "cloud", "scalable", "backend", "frontend",
    "ml", "tensorflow", "pytorch", "data pipelines", "analytics", "system design",
]

STOP_WORDS = {"with", "that", "from", "have", "will", "your", "build", "role", "this", "into", "across", "about", "team", "work", "years"}


def _has_numbers(text: str) -> bool:
    return bool(re.search(r"\d", text))


def score_resume_for_ats(resume: dict[str, Any]) -> dict[str, Any]:
    breakdown = [
        {"label": "Contact details", "score": 0, "max": 15},
        {"label": "Summary", "score": 0, "max": 10},
        {"label": "Education", "score": 0, "max": 10},
        {"label": "Skills", "score": 0, "max": 15},
        {"label": "Experience", "score": 0, "max": 20},
        {"label": "Projects", "score": 0, "max": 15},
        {"label": "Impact evidence", "score": 0, "max": 10},
        {"label": "Structure quality", "score": 0, "max": 5},
    ]
    warnings: list[str] = []
    tips: list[str] = []

    header = resume.get("header", {})
    contact_filled = len([value for value in [header.get("name"), header.get("email"), header.get("phone"), header.get("role")] if value])
    breakdown[0]["score"] = 15 if contact_filled >= 4 else contact_filled * 3
    if contact_filled < 3:
        warnings.append("Add stronger header/contact coverage.")

    summary = resume.get("summary", {})
    breakdown[1]["score"] = 10 if summary.get("content") else 0
    if not summary.get("content"):
        tips.append("Add a professional summary when it clarifies your target role.")

    breakdown[2]["score"] = 10 if resume.get("education") else 0

    skills = resume.get("skills", {})
    skills_score = len(skills.get("items", [])) * 2
    for group in skills.get("groups", []):
        skills_score += min(len(group.get("items", [])), 3)
    breakdown[3]["score"] = min(15, skills_score)

    breakdown[4]["score"] = min(20, len(resume.get("experience", [])) * 10)
    breakdown[5]["score"] = min(15, len(resume.get("projects", [])) * 5)

    impact_signals = []
    for item in resume.get("experience", []):
        impact_signals.extend(item.get("description", {}).get("bullets", []))
    for item in resume.get("projects", []):
        impact_signals.extend(item.get("description", {}).get("bullets", []))
    impact_count = len([item for item in impact_signals if _has_numbers(item)])
    breakdown[6]["score"] = min(10, impact_count * 3)
    breakdown[7]["score"] = 5 if (skills.get("items") or skills.get("groups") or resume.get("experience") or resume.get("projects")) else 1

    if not resume.get("experience"):
        tips.append("Add at least one experience entry, even if it is internship or part-time work.")
    if not resume.get("projects"):
        tips.append("Projects help ATS and recruiter review when experience is still thin.")
    if not impact_count:
        tips.append("Use numbers in bullets where they show impact, scale, or speed.")

    score = sum(item["score"] for item in breakdown)
    verdict = "Strong ATS readiness" if score >= 80 else "Good baseline with a few gaps" if score >= 60 else "Needs more ATS-friendly structure and evidence"

    return {"breakdown": breakdown, "score": score, "tips": tips, "verdict": verdict, "warnings": warnings}


def derive_jd_parsed_meta(text: str, source_name: str = "") -> dict[str, Any]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    title = lines[0] if lines else re.sub(r"\.[^.]+$", "", source_name) or "Imported JD"
    company = lines[1] if len(lines) > 1 else "Imported Company"
    lower = text.lower()
    skill_hits = [skill for skill in COMMON_SKILLS if skill in lower]
    words = re.findall(r"[a-z][a-z.+-]{2,}", lower)
    counts: dict[str, int] = {}
    for word in words:
        if word in STOP_WORDS:
            continue
        counts[word] = counts.get(word, 0) + 1
    ranked_words = [word for word, _count in sorted(counts.items(), key=lambda item: item[1], reverse=True)]
    ranked_words = [word for word in ranked_words if word not in skill_hits][:8]
    return {
        "company": company,
        "keywordBuckets": {
            "preferred": ranked_words[4:],
            "required": list(dict.fromkeys(skill_hits[:5] + ranked_words[:4])),
            "skills": skill_hits,
            "titles": [token for token in re.split(r"[^a-z0-9+.#-]+", title.lower()) if token],
        },
        "roleTitle": title,
        "summary": " ".join(lines[2:6]) or None,
    }


def score_resume_against_jd(resume: dict[str, Any], jd: dict[str, Any]) -> dict[str, Any]:
    text = build_resume_plain_text(resume).lower()
    keyword_buckets = jd.get("keywordBuckets", {})
    required = list(dict.fromkeys(keyword_buckets.get("required", [])))
    preferred = list(dict.fromkeys(keyword_buckets.get("preferred", [])))
    combined = required + preferred
    found_keywords = [keyword for keyword in combined if keyword.lower() in text]
    missing_keywords = [keyword for keyword in combined if keyword.lower() not in text]

    required_hits = [keyword for keyword in required if keyword in found_keywords]
    preferred_hits = [keyword for keyword in preferred if keyword in found_keywords]
    required_coverage = round((len(required_hits) / len(required)) * 100) if required else 70
    preferred_coverage = round((len(preferred_hits) / len(preferred)) * 100) if preferred else 60
    title_alignment = 85 if any(token in text for token in keyword_buckets.get("titles", [])) else 45
    evidence_readiness = min(95, len(resume.get("experience", [])) * 18 + len(resume.get("projects", [])) * 12 + 20)
    score = round((required_coverage * 0.4) + (preferred_coverage * 0.2) + (title_alignment * 0.2) + (evidence_readiness * 0.2))

    tone = "high" if score >= 75 else "mid" if score >= 50 else "low"
    verdict = "Strong match for this role" if tone == "high" else "Promising match with a few gaps" if tone == "mid" else "Needs targeted tailoring"

    metrics = [
        {"label": "Keyword coverage", "tone": "accent" if required_coverage >= 70 else "warn", "value": required_coverage},
        {"label": "Preferred overlap", "tone": "accent" if preferred_coverage >= 60 else "warn", "value": preferred_coverage},
        {"label": "Role alignment", "tone": "accent" if title_alignment >= 70 else "warn", "value": title_alignment},
        {"label": "Evidence readiness", "tone": "accent" if evidence_readiness >= 70 else "warn", "value": evidence_readiness},
    ]

    checks = [
        {"text": f"Matched {len(found_keywords)} JD keywords", "tone": "ok" if len(found_keywords) >= max(2, math.ceil(len(required) / 2)) else "warn"},
        {"text": "Resume structure is readable enough for recruiter review", "tone": "ok" if (resume.get("experience") or resume.get("projects")) else "warn"},
        {"text": f"Address {len(missing_keywords)} keyword gaps before applying", "tone": "warn" if len(missing_keywords) <= 2 else "bad"},
        {"text": "Tailor summary and role-specific bullets to this job", "tone": "warn" if tone == "high" else "bad"},
    ]

    return {
        "checks": checks,
        "foundKeywords": found_keywords,
        "metrics": metrics,
        "missingKeywords": missing_keywords,
        "score": score,
        "tone": tone,
        "verdict": verdict,
    }

