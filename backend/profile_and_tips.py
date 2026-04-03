from __future__ import annotations


def get_profile_summary() -> dict[str, str]:
    return {
        "email": "arjun@email.com",
        "memberSince": "Jan 2026",
        "name": "Arjun Kumar",
        "plan": "Free Plan",
    }


def build_usage_metrics(resume_count: int, jd_count: int) -> list[dict[str, int | str]]:
    return [
        {"label": "ATS analyses", "used": min(max(resume_count, 1), 50), "total": 50},
        {"label": "JD comparisons", "used": min(max(jd_count, 1), 20), "total": 20},
        {"label": "PDF exports", "used": 2, "total": 100},
        {"label": "Parses today", "used": min(resume_count + jd_count, 3), "total": 3},
    ]


DASHBOARD_TIPS = [
    "Use numbers when they clarify scale, speed, quality, or reach.",
    "Start each bullet with a strong action verb - Led, Built, Reduced, Designed.",
    "Keep your resume to one page unless you have 10+ years of experience.",
    "Tailor your skills section to match the job description keywords.",
    "Add a professional summary only when it adds value, not filler.",
]

