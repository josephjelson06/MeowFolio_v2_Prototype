from __future__ import annotations

import json
from contextlib import contextmanager
from typing import Any, Iterator

import psycopg
from psycopg.rows import dict_row

from .app_config import ENV


@contextmanager
def get_conn() -> Iterator[psycopg.Connection]:
    connection = psycopg.connect(ENV.database_url, row_factory=dict_row)
    try:
        yield connection
    finally:
        connection.close()


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()
        conn.commit()
    return list(rows)


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            row = cur.fetchone()
        conn.commit()
    return row


def execute(query: str, params: tuple[Any, ...] = ()) -> int:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            count = cur.rowcount
        conn.commit()
    return count


def fetch_scalar(query: str, params: tuple[Any, ...] = ()) -> Any:
    row = fetch_one(query, params)
    if not row:
        return None
    return next(iter(row.values()))


def to_json(value: Any) -> str:
    return json.dumps(value)

