from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from .db import execute, fetch_all, fetch_one, fetch_scalar, to_json
from .formatters import format_relative_time


def _iso(value: Any) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _map_resume_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "content": row["content_json"],
        "createdAt": _iso(row["created_at"]),
        "id": str(row["id"]),
        "rawText": row.get("raw_text") or "",
        "renderOptions": row["render_options_json"],
        "source": row["source"],
        "templateId": row["template_id"],
        "title": row["title"],
        "updatedAt": _iso(row["updated_at"]),
    }


def to_resume_summary(resume: dict[str, Any], recent: bool = False) -> dict[str, Any]:
    return {
        "id": resume["id"],
        "name": resume["title"],
        "recent": recent,
        "template": resume["templateId"],
        "updated": format_relative_time(resume["updatedAt"]),
        "updatedAt": resume["updatedAt"],
    }


def count_resumes(user_id: str | None = None) -> int:
    query = "SELECT COUNT(*)::text AS count FROM resumes WHERE user_id = %s" if user_id else "SELECT COUNT(*)::text AS count FROM resumes"
    count = fetch_scalar(query, (user_id,)) if user_id else fetch_scalar(query)
    return int(count or 0)


def list_resumes(user_id: str | None = None) -> list[dict[str, Any]]:
    rows = fetch_all(
        "SELECT * FROM resumes WHERE user_id = %s ORDER BY updated_at DESC, created_at DESC" if user_id else
        "SELECT * FROM resumes ORDER BY updated_at DESC, created_at DESC",
        (user_id,) if user_id else (),
    )
    return [_map_resume_row(row) for row in rows]


def get_resume_by_id(resume_id: str, user_id: str | None = None) -> dict[str, Any] | None:
    row = fetch_one(
        "SELECT * FROM resumes WHERE id = %s AND user_id = %s LIMIT 1" if user_id else
        "SELECT * FROM resumes WHERE id = %s LIMIT 1",
        (resume_id, user_id) if user_id else (resume_id,),
    )
    return _map_resume_row(row) if row else None


def create_resume(input_data: dict[str, Any]) -> dict[str, Any]:
    row = fetch_one(
        """
        INSERT INTO resumes (id, user_id, title, source, template_id, content_json, render_options_json, raw_text)
        VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s)
        RETURNING *
        """,
        (
            str(uuid4()),
            input_data.get("userId"),
            input_data["title"],
            input_data["source"],
            input_data["templateId"],
            to_json(input_data["content"]),
            to_json(input_data["renderOptions"]),
            input_data.get("rawText", ""),
        ),
    )
    assert row is not None
    return _map_resume_row(row)


def update_resume(resume_id: str, patch: dict[str, Any], user_id: str | None = None) -> dict[str, Any] | None:
    current = get_resume_by_id(resume_id, user_id)
    if not current:
        return None

    row = fetch_one(
        """
        UPDATE resumes
           SET title = %s,
               template_id = %s,
               content_json = %s::jsonb,
               render_options_json = %s::jsonb,
               raw_text = %s,
               updated_at = NOW()
         WHERE id = %s
        """ + (" AND user_id = %s" if user_id else "") + """
         RETURNING *
        """,
        (
            patch.get("title", current["title"]),
            patch.get("templateId", current["templateId"]),
            to_json(patch.get("content", current["content"])),
            to_json(patch.get("renderOptions", current["renderOptions"])),
            patch.get("rawText", current["rawText"]),
            resume_id,
            *((user_id,) if user_id else ()),
        ),
    )
    return _map_resume_row(row) if row else None


def delete_resume(resume_id: str, user_id: str | None = None) -> bool:
    count = execute(
        "DELETE FROM resumes WHERE id = %s" + (" AND user_id = %s" if user_id else ""),
        (resume_id, *((user_id,) if user_id else ())),
    )
    return count > 0


def _map_jd_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "badge": row["badge"],
        "company": row.get("company") or "",
        "createdAt": _iso(row["created_at"]),
        "id": str(row["id"]),
        "parsedMeta": row["parsed_json"],
        "rawText": row["raw_text"],
        "title": row["title"],
        "type": row["type"],
        "updatedAt": _iso(row["updated_at"]),
    }


def to_jd_record(jd: dict[str, Any]) -> dict[str, Any]:
    return {
        "badge": jd["badge"],
        "company": jd["company"],
        "id": jd["id"],
        "parsedMeta": jd["parsedMeta"],
        "parsedText": jd["rawText"],
        "title": jd["title"],
        "type": jd["type"],
        "updatedAt": format_relative_time(jd["updatedAt"]),
    }


def count_jds(user_id: str | None = None) -> int:
    query = "SELECT COUNT(*)::text AS count FROM job_descriptions WHERE user_id = %s" if user_id else "SELECT COUNT(*)::text AS count FROM job_descriptions"
    count = fetch_scalar(query, (user_id,)) if user_id else fetch_scalar(query)
    return int(count or 0)


def list_jds(user_id: str | None = None) -> list[dict[str, Any]]:
    rows = fetch_all(
        "SELECT * FROM job_descriptions WHERE user_id = %s ORDER BY updated_at DESC, created_at DESC" if user_id else
        "SELECT * FROM job_descriptions ORDER BY updated_at DESC, created_at DESC",
        (user_id,) if user_id else (),
    )
    return [_map_jd_row(row) for row in rows]


def get_jd_by_id(jd_id: str, user_id: str | None = None) -> dict[str, Any] | None:
    row = fetch_one(
        "SELECT * FROM job_descriptions WHERE id = %s AND user_id = %s LIMIT 1" if user_id else
        "SELECT * FROM job_descriptions WHERE id = %s LIMIT 1",
        (jd_id, user_id) if user_id else (jd_id,),
    )
    return _map_jd_row(row) if row else None


def create_jd(input_data: dict[str, Any]) -> dict[str, Any]:
    row = fetch_one(
        """
        INSERT INTO job_descriptions (id, user_id, title, company, type, badge, raw_text, parsed_json)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)
        RETURNING *
        """,
        (
            str(uuid4()),
            input_data.get("userId"),
            input_data["title"],
            input_data["company"],
            input_data.get("type", "Imported"),
            input_data.get("badge", "Newly added"),
            input_data["rawText"],
            to_json(input_data["parsedMeta"]),
        ),
    )
    assert row is not None
    return _map_jd_row(row)


def update_jd(jd_id: str, patch: dict[str, Any], user_id: str | None = None) -> dict[str, Any] | None:
    current = get_jd_by_id(jd_id, user_id)
    if not current:
        return None
    row = fetch_one(
        """
        UPDATE job_descriptions
           SET title = %s,
               company = %s,
               type = %s,
               badge = %s,
               raw_text = %s,
               parsed_json = %s::jsonb,
               updated_at = NOW()
         WHERE id = %s
        """ + (" AND user_id = %s" if user_id else "") + """
         RETURNING *
        """,
        (
            patch.get("title", current["title"]),
            patch.get("company", current["company"]),
            patch.get("type", current["type"]),
            patch.get("badge", current["badge"]),
            patch.get("rawText", current["rawText"]),
            to_json(patch.get("parsedMeta", current["parsedMeta"])),
            jd_id,
            *((user_id,) if user_id else ()),
        ),
    )
    return _map_jd_row(row) if row else None


def delete_jd(jd_id: str, user_id: str | None = None) -> bool:
    count = execute(
        "DELETE FROM job_descriptions WHERE id = %s" + (" AND user_id = %s" if user_id else ""),
        (jd_id, *((user_id,) if user_id else ())),
    )
    return count > 0


def get_user_by_id(user_id: str) -> dict[str, Any] | None:
    row = fetch_one("SELECT * FROM users WHERE id = %s LIMIT 1", (user_id,))
    if not row:
        return None
    return {
        "avatarUrl": row.get("avatar_url"),
        "createdAt": _iso(row["created_at"]),
        "email": row.get("email"),
        "googleSub": row.get("google_sub"),
        "id": str(row["id"]),
        "name": row.get("name"),
        "updatedAt": _iso(row["updated_at"]),
    }


def get_user_by_email(email: str) -> dict[str, Any] | None:
    row = fetch_one("SELECT * FROM users WHERE email = %s LIMIT 1", (email,))
    if not row:
        return None
    return {
        "avatarUrl": row.get("avatar_url"),
        "createdAt": _iso(row["created_at"]),
        "email": row.get("email"),
        "googleSub": row.get("google_sub"),
        "id": str(row["id"]),
        "name": row.get("name"),
        "updatedAt": _iso(row["updated_at"]),
    }


def get_default_dev_user() -> dict[str, Any] | None:
    return get_user_by_email("demo@resumeai.local")


def record_upload(owner_type: str, owner_id: str | None, original_name: str, mime_type: str, size_bytes: int, storage_path: str, extracted_text: str) -> None:
    execute(
        """
        INSERT INTO uploads (id, owner_type, owner_id, original_name, mime_type, size_bytes, storage_path, extracted_text)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (str(uuid4()), owner_type, owner_id, original_name, mime_type, size_bytes, storage_path, extracted_text),
    )
