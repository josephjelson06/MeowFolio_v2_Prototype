from __future__ import annotations

from uuid import uuid4

from .contracts import clone_render_options, create_empty_description_field, create_empty_link_field, create_empty_resume_data
from .db import execute, fetch_one
from .repositories import count_jds, count_resumes, create_jd, create_resume
from .scoring import derive_jd_parsed_meta


def _slug_name(value: str) -> str:
    return value.lower().replace(" ", "_").replace("-", "_")


def build_demo_resume(name: str, title: str, template_id: str, summary: str, skills: list[str], experience_bullets: list[str]) -> dict:
    resume = create_empty_resume_data("scratch")
    resume["header"]["name"] = name
    resume["header"]["email"] = "arjun@email.com"
    resume["header"]["phone"] = "+91 98765 43210"
    resume["header"]["role"] = title
    resume["header"]["github"] = {**create_empty_link_field(), "url": "github.com/arjunkumar"}
    resume["header"]["linkedin"] = {**create_empty_link_field(), "url": "linkedin.com/in/arjunkumar"}
    resume["summary"]["content"] = summary
    resume["skills"]["items"] = skills
    resume["experience"] = [{
        "company": "meowfolio",
        "date": {"endMonth": "", "endYear": "", "isOngoing": True, "mode": "mm-yyyy-present", "startMonth": "Jan", "startYear": "2025"},
        "description": {**create_empty_description_field("bullets"), "bullets": experience_bullets},
        "isCurrent": True,
        "location": "Remote",
        "role": title,
    }]
    resume["projects"] = [{
        "date": {"endMonth": "", "endYear": "2025", "isOngoing": False, "mode": "yyyy-range", "startMonth": "", "startYear": "2024"},
        "description": {**create_empty_description_field("bullets"), "bullets": ["Built full-stack resume workflows and improved iteration loops for job applications."]},
        "githubLink": {**create_empty_link_field(), "url": "github.com/arjunkumar/meowfolio"},
        "liveLink": create_empty_link_field(),
        "technologies": ["React", "TypeScript", "PostgreSQL"],
        "title": "meowfolio",
    }]
    render_options = clone_render_options()
    render_options["templateId"] = template_id
    return {
        "content": resume,
        "rawText": f"{name}\n{title}\n{summary}\nSkills: {', '.join(skills)}",
        "renderOptions": render_options,
        "source": "scratch",
        "templateId": template_id,
        "title": f"{_slug_name(title)}.tex",
    }


def ensure_demo_user() -> str:
    existing = fetch_one("SELECT id FROM users WHERE email = %s LIMIT 1", ("demo@resumeai.local",))
    if existing and existing.get("id"):
        return existing["id"]
    inserted = fetch_one(
        """
        INSERT INTO users (id, email, name, google_sub)
        VALUES (%s, %s, %s, %s)
        RETURNING id
        """,
        (str(uuid4()), "demo@resumeai.local", "Demo User", "demo-google-sub"),
    )
    assert inserted is not None
    return inserted["id"]


def seed_demo_data() -> None:
    demo_user_id = ensure_demo_user()

    execute("UPDATE resumes SET user_id = %s WHERE user_id IS NULL", (demo_user_id,))
    execute("UPDATE job_descriptions SET user_id = %s WHERE user_id IS NULL", (demo_user_id,))

    if count_resumes(demo_user_id) == 0:
        create_resume({**build_demo_resume("Arjun Kumar", "Software Engineer", "template1", "Software engineer with experience across full-stack delivery, API performance, and resume tailoring workflows.", ["Python", "React", "Node.js", "AWS", "Docker", "PostgreSQL"], ["Built REST APIs and internal tools used across product teams.", "Improved response times by 37% and reduced manual review effort."]), "userId": demo_user_id})
        create_resume({**build_demo_resume("Arjun Kumar", "Frontend Engineer", "template2", "Frontend-focused engineer with strong UI delivery, system thinking, and performance habits.", ["React", "TypeScript", "Design Systems", "Accessibility"], ["Shipped responsive product surfaces across web and mobile breakpoints.", "Reduced layout regressions by building reusable UI primitives."]), "userId": demo_user_id})
        create_resume({**build_demo_resume("Arjun Kumar", "Data Engineer", "template4", "Data engineer working across pipelines, analytics foundations, and product instrumentation.", ["Python", "SQL", "Airflow", "dbt", "AWS"], ["Designed data pipelines used for operational and product reporting.", "Improved warehouse freshness and reduced dashboard lag."]), "userId": demo_user_id})

    if count_jds(demo_user_id) == 0:
        seed_jds = [
            "Software Engineer II\nGoogle\nBuild product features, APIs, and internal tooling using Python, React, cloud systems, and scalable architecture.",
            "Senior Frontend Dev\nRazorpay\nOwn frontend architecture, performance, React systems, and UX polish.",
            "ML Engineer\nOpenAI\nTrain, evaluate, and deploy model-driven workflows using Python, ML tooling, and cloud systems.",
            "Platform Engineer\nStripe\nScale internal platform reliability, developer tooling, and backend systems.",
            "Data Engineer\nNotion\nDesign pipelines, SQL models, data infrastructure, and analytics foundations.",
        ]
        for jd_text in seed_jds:
            meta = derive_jd_parsed_meta(jd_text)
            create_jd({
                "badge": "Seeded demo JD",
                "company": meta.get("company") or "",
                "parsedMeta": meta,
                "rawText": jd_text,
                "title": meta.get("roleTitle") or "Imported JD",
                "type": "Full-time",
                "userId": demo_user_id,
            })


if __name__ == "__main__":
    seed_demo_data()
    print("Demo data seeded.")
