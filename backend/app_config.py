from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_ROOT.parent
ENV_PATH = PROJECT_ROOT / ".env.local"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)


def _read_string(name: str, fallback: str = "") -> str:
    value = os.getenv(name, "").strip()
    return value or fallback


def _read_number(name: str, fallback: int) -> int:
    raw = os.getenv(name, "").strip()
    try:
        value = int(raw)
    except ValueError:
        return fallback
    return value if value > 0 else fallback


def _read_csv(name: str, fallback: list[str]) -> list[str]:
    raw = _read_string(name)
    if not raw:
        return list(fallback)
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Paths:
    backend_root: Path
    project_root: Path
    uploads_dir: Path
    migrations_dir: Path
    template_images_dir: Path
    tex_templates_dir: Path


PATHS = Paths(
    backend_root=BACKEND_ROOT,
    project_root=PROJECT_ROOT,
    uploads_dir=BACKEND_ROOT / "uploads",
    migrations_dir=BACKEND_ROOT / "migrations",
    template_images_dir=PROJECT_ROOT / "Templates",
    tex_templates_dir=PROJECT_ROOT / "Tex Templates",
)


def _build_frontend_origins(values: list[str]) -> list[str]:
    normalized = {value for value in values if value}
    normalized.add("http://localhost:5173")
    return sorted(normalized)


@dataclass(frozen=True)
class Env:
    port: int
    database_url: str
    frontend_origins: list[str]
    upload_dir: Path
    max_upload_size_mb: int
    allowed_upload_types: list[str]
    ai_provider: str
    groq_api_key: str
    groq_model: str
    compiler_image: str


ENV = Env(
    port=_read_number("PORT", 4000),
    database_url=_read_string("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/resumeai"),
    frontend_origins=_build_frontend_origins(_read_csv("FRONTEND_ORIGIN", ["http://localhost:5173"])),
    upload_dir=Path(_read_string("UPLOAD_DIR", str(PATHS.uploads_dir))),
    max_upload_size_mb=_read_number("MAX_UPLOAD_SIZE_MB", 10),
    allowed_upload_types=[item.strip().lower() for item in _read_csv(
        "ALLOWED_UPLOAD_TYPES",
        [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/markdown",
        ],
    ) if item.strip()],
    ai_provider=_read_string("AI_PROVIDER", "groq"),
    groq_api_key=_read_string("GROQ_API_KEY"),
    groq_model=_read_string("GROQ_MODEL", "llama-3.3-70b-versatile"),
    compiler_image=_read_string("COMPILER_IMAGE"),
)

ENV.upload_dir.mkdir(parents=True, exist_ok=True)

