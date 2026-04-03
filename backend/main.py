from __future__ import annotations

import shutil
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from uuid import UUID
from uuid import uuid4

from fastapi import FastAPI, File, Header, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .app_config import ENV, PATHS
from .imports import extract_text_from_upload, import_resume_from_text
from .migrate import run_migrations
from .normalizer import normalize_render_options, normalize_resume_data
from .profile_and_tips import DASHBOARD_TIPS, build_usage_metrics, get_profile_summary
from .repositories import (
    create_jd,
    create_resume,
    delete_jd,
    delete_resume,
    get_default_dev_user,
    get_jd_by_id,
    get_resume_by_id,
    get_user_by_id,
    list_jds,
    list_resumes,
    record_upload,
    to_jd_record,
    to_resume_summary,
    update_jd,
    update_resume,
)
from .scoring import derive_jd_parsed_meta, score_resume_against_jd, score_resume_for_ats
from .seed import seed_demo_data
from .templates import TEMPLATE_REGISTRY, build_tex_export_payload, get_template_runtime_meta


def actor_user_id(x_user_id: str | None) -> str | None:
    candidate = x_user_id.strip() if isinstance(x_user_id, str) and x_user_id.strip() else None
    if candidate:
        try:
            return str(UUID(candidate))
        except ValueError:
            pass

    default_actor = get_default_dev_user()
    return default_actor["id"] if default_actor else None


def ensure_upload_type(upload: UploadFile) -> None:
    extension = Path(upload.filename or "").suffix.lower()
    mime = (upload.content_type or "").lower()
    if mime in ENV.allowed_upload_types or extension in ENV.allowed_upload_types:
        return
    raise HTTPException(status_code=415, detail=f"Unsupported upload type: {mime or extension or 'unknown'}")


async def save_upload(upload: UploadFile) -> Path:
    ensure_upload_type(upload)
    filename = f"{int(time.time() * 1000)}-{uuid4()}{Path(upload.filename or '').suffix}"
    destination = ENV.upload_dir / filename
    with destination.open("wb") as handle:
        shutil.copyfileobj(upload.file, handle)
    return destination


@asynccontextmanager
async def lifespan(_app: FastAPI):
    run_migrations()
    seed_demo_data()
    yield


app = FastAPI(title="meowfolio backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ENV.frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static/templates", StaticFiles(directory=PATHS.template_images_dir), name="templates")


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.get("/api/health")
def health():
    from .db import fetch_scalar

    migration_count = fetch_scalar("SELECT COUNT(*)::text AS count FROM schema_migrations") or 0
    return {
        "aiProvider": ENV.ai_provider,
        "compilerConfigured": bool(ENV.compiler_image),
        "ok": True,
        "runtime": get_template_runtime_meta(),
        "schemaMigrations": int(migration_count),
    }


@app.get("/api/templates")
def templates():
    return {"items": TEMPLATE_REGISTRY, "runtime": get_template_runtime_meta()}


@app.get("/api/session")
def session(x_user_id: str | None = Header(default=None)):
    requested_user_id = actor_user_id(x_user_id)
    actor = get_user_by_id(requested_user_id) if requested_user_id else None
    return {
        "actor": ({
            "avatarUrl": actor.get("avatarUrl"),
            "email": actor.get("email"),
            "id": actor.get("id"),
            "name": actor.get("name"),
        } if actor else None),
        "mode": "dev",
    }


@app.get("/api/tips")
def tips():
    return {"items": DASHBOARD_TIPS}


@app.get("/api/profile")
def profile(x_user_id: str | None = Header(default=None)):
    user_id = actor_user_id(x_user_id)
    return {
        "summary": get_profile_summary(),
        "usage": build_usage_metrics(len(list_resumes(user_id)), len(list_jds(user_id))),
    }


@app.get("/api/resumes")
def resumes(x_user_id: str | None = Header(default=None)):
    items = list_resumes(actor_user_id(x_user_id))
    return {"items": [to_resume_summary(item, index == 0) for index, item in enumerate(items)]}


@app.post("/api/resumes")
async def create_resume_endpoint(request: Request, x_user_id: str | None = Header(default=None)):
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    title = body.get("title").strip() if isinstance(body.get("title"), str) and body.get("title").strip() else f"resume_{int(time.time())}.tex"
    template_id = body.get("templateId") if isinstance(body.get("templateId"), str) else "template1"
    resume = create_resume({
        "content": normalize_resume_data(body.get("content"), "scratch"),
        "rawText": body.get("rawText") if isinstance(body.get("rawText"), str) else "",
        "renderOptions": normalize_render_options({**(body.get("renderOptions") or {}), "templateId": template_id}),
        "source": "scratch",
        "templateId": template_id,
        "title": title,
        "userId": actor_user_id(x_user_id),
    })
    return JSONResponse(status_code=201, content={"item": to_resume_summary(resume, True), "record": resume})


@app.get("/api/resumes/{resume_id}")
def get_resume(resume_id: str, x_user_id: str | None = Header(default=None)):
    resume = get_resume_by_id(resume_id, actor_user_id(x_user_id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"record": resume}


@app.patch("/api/resumes/{resume_id}")
async def patch_resume(resume_id: str, request: Request, x_user_id: str | None = Header(default=None)):
    body = await request.json()
    updated = update_resume(
        resume_id,
        {
            "content": normalize_resume_data(body.get("content"), "scratch") if body.get("content") is not None else None,
            "rawText": body.get("rawText") if isinstance(body.get("rawText"), str) else None,
            "renderOptions": normalize_render_options(body.get("renderOptions")) if body.get("renderOptions") is not None else None,
            "templateId": body.get("templateId").strip() if isinstance(body.get("templateId"), str) else None,
            "title": body.get("title").strip() if isinstance(body.get("title"), str) else None,
        },
        actor_user_id(x_user_id),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"item": to_resume_summary(updated, True), "record": updated}


@app.delete("/api/resumes/{resume_id}", status_code=204)
def remove_resume(resume_id: str, x_user_id: str | None = Header(default=None)):
    deleted = delete_resume(resume_id, actor_user_id(x_user_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return Response(status_code=204)


async def _parse_import_request(request: Request) -> tuple[str, str, UploadFile | None]:
    content_type = request.headers.get("content-type", "")
    if content_type.startswith("application/json"):
        body = await request.json()
        text_body = body.get("text", "").strip() if isinstance(body.get("text"), str) else ""
        source_name = body.get("sourceName") if isinstance(body.get("sourceName"), str) else ""
        return text_body, source_name, None

    form = await request.form()
    form_file = form.get("file")
    uploaded_file = form_file if isinstance(form_file, UploadFile) else None
    text_body = form.get("text", "").strip() if isinstance(form.get("text"), str) else ""
    source_name = form.get("sourceName") if isinstance(form.get("sourceName"), str) else (uploaded_file.filename if uploaded_file else "")
    return text_body, source_name, uploaded_file


@app.post("/api/import/resume")
async def import_resume(request: Request, x_user_id: str | None = Header(default=None)):
    text_body, source_name, uploaded_file = await _parse_import_request(request)
    extracted_text = text_body
    file_path: Path | None = None
    import_source_name = source_name or (uploaded_file.filename if uploaded_file else "") or "Imported Resume"
    if uploaded_file:
        file_path = await save_upload(uploaded_file)
        extracted_text = extract_text_from_upload(file_path, uploaded_file.filename or source_name, uploaded_file.content_type or "")

    imported = import_resume_from_text(extracted_text, import_source_name)
    resume = create_resume({
        "content": imported["resume"],
        "rawText": imported["extractedText"],
        "renderOptions": imported["renderOptions"],
        "source": imported["resume"]["meta"]["source"],
        "templateId": imported["renderOptions"]["templateId"],
        "title": imported["title"],
        "userId": actor_user_id(x_user_id),
    })

    if uploaded_file and file_path:
        record_upload("resume", resume["id"], uploaded_file.filename or source_name, uploaded_file.content_type or "", file_path.stat().st_size, str(file_path), imported["extractedText"])

    return JSONResponse(status_code=201, content={
        "extractedText": imported["extractedText"],
        "item": to_resume_summary(resume, True),
        "parseStatus": imported["parseStatus"],
        "record": resume,
        "resumeId": resume["id"],
        "warnings": imported["warnings"],
    })


@app.post("/api/resumes/{resume_id}/ats-score")
def ats_score(resume_id: str, x_user_id: str | None = Header(default=None)):
    resume = get_resume_by_id(resume_id, actor_user_id(x_user_id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return score_resume_for_ats(resume["content"])


@app.get("/api/resumes/{resume_id}/export/tex")
def export_tex(resume_id: str, x_user_id: str | None = Header(default=None)):
    resume = get_resume_by_id(resume_id, actor_user_id(x_user_id))
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return build_tex_export_payload(resume["title"], resume["content"], resume["renderOptions"])


@app.get("/api/jds")
def jd_list(x_user_id: str | None = Header(default=None)):
    return {"items": [to_jd_record(item) for item in list_jds(actor_user_id(x_user_id))]}


@app.post("/api/jds")
async def create_jd_endpoint(request: Request, x_user_id: str | None = Header(default=None)):
    body = await request.json()
    text = body.get("text", "").strip() if isinstance(body.get("text"), str) else ""
    if not text:
        raise HTTPException(status_code=400, detail="JD text is required.")
    parsed_meta = derive_jd_parsed_meta(text, body.get("title", "") if isinstance(body.get("title"), str) else "")
    jd = create_jd({
        "badge": body.get("badge"),
        "company": body.get("company") if isinstance(body.get("company"), str) else (parsed_meta.get("company") or "Imported Company"),
        "parsedMeta": parsed_meta,
        "rawText": text,
        "title": body.get("title").strip() if isinstance(body.get("title"), str) and body.get("title").strip() else (parsed_meta.get("roleTitle") or "Imported JD"),
        "type": body.get("type") if isinstance(body.get("type"), str) else "Imported",
        "userId": actor_user_id(x_user_id),
    })
    return JSONResponse(status_code=201, content={"item": to_jd_record(jd), "record": jd})


@app.get("/api/jds/{jd_id}")
def get_jd(jd_id: str, x_user_id: str | None = Header(default=None)):
    jd = get_jd_by_id(jd_id, actor_user_id(x_user_id))
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found.")
    return {"item": to_jd_record(jd), "record": jd}


@app.patch("/api/jds/{jd_id}")
async def patch_jd(jd_id: str, request: Request, x_user_id: str | None = Header(default=None)):
    body = await request.json()
    raw_text = body.get("text").strip() if isinstance(body.get("text"), str) else None
    parsed_meta = derive_jd_parsed_meta(raw_text, body.get("title", "") if isinstance(body.get("title"), str) else "") if raw_text else None
    jd = update_jd(jd_id, {
        "badge": body.get("badge") if isinstance(body.get("badge"), str) else None,
        "company": body.get("company") if isinstance(body.get("company"), str) else None,
        "parsedMeta": parsed_meta,
        "rawText": raw_text,
        "title": body.get("title").strip() if isinstance(body.get("title"), str) else None,
        "type": body.get("type") if isinstance(body.get("type"), str) else None,
    }, actor_user_id(x_user_id))
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found.")
    return {"item": to_jd_record(jd), "record": jd}


@app.delete("/api/jds/{jd_id}", status_code=204)
def remove_jd(jd_id: str, x_user_id: str | None = Header(default=None)):
    deleted = delete_jd(jd_id, actor_user_id(x_user_id))
    if not deleted:
        raise HTTPException(status_code=404, detail="JD not found.")
    return Response(status_code=204)


@app.post("/api/import/jd")
async def import_jd(request: Request, x_user_id: str | None = Header(default=None)):
    text_body, source_name, uploaded_file = await _parse_import_request(request)
    extracted_text = text_body
    file_path: Path | None = None
    import_source_name = source_name or (uploaded_file.filename if uploaded_file else "") or "Imported JD"
    if uploaded_file:
        file_path = await save_upload(uploaded_file)
        extracted_text = extract_text_from_upload(file_path, uploaded_file.filename or source_name, uploaded_file.content_type or "")
    if not extracted_text:
        raise HTTPException(status_code=400, detail="JD text is required.")
    parsed_meta = derive_jd_parsed_meta(extracted_text, import_source_name)
    jd = create_jd({
        "badge": "Newly added",
        "company": parsed_meta.get("company") or "Imported Company",
        "parsedMeta": parsed_meta,
        "rawText": extracted_text,
        "title": parsed_meta.get("roleTitle") or "Imported JD",
        "type": "Imported",
        "userId": actor_user_id(x_user_id),
    })
    if uploaded_file and file_path:
        record_upload("jd", jd["id"], uploaded_file.filename or source_name, uploaded_file.content_type or "", file_path.stat().st_size, str(file_path), extracted_text)
    return JSONResponse(status_code=201, content={"extractedText": extracted_text, "item": to_jd_record(jd), "record": jd})


@app.post("/api/jds/{jd_id}/match-score")
async def jd_match(jd_id: str, request: Request, x_user_id: str | None = Header(default=None)):
    user_id = actor_user_id(x_user_id)
    jd = get_jd_by_id(jd_id, user_id)
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found.")
    body = await request.json()
    resume = get_resume_by_id(body.get("resumeId", "") if isinstance(body.get("resumeId"), str) else "", user_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"jd": to_jd_record(jd), "report": score_resume_against_jd(resume["content"], jd["parsedMeta"]), "resume": to_resume_summary(resume, False)}
