from __future__ import annotations

from .app_config import PATHS
from .db import execute, get_conn


def run_migrations() -> None:
    execute("CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'schema_migrations'")
            columns = {row["column_name"] for row in cur.fetchall()}
            key_column = "name" if "name" in columns else "id"
            cur.execute(f"SELECT {key_column} FROM schema_migrations")
            applied = {row[key_column] for row in cur.fetchall()}
            for migration in sorted(PATHS.migrations_dir.glob("*.sql")):
                if migration.name in applied:
                    continue
                cur.execute(migration.read_text(encoding="utf-8"))
                cur.execute(f"INSERT INTO schema_migrations ({key_column}) VALUES (%s)", (migration.name,))
        conn.commit()


if __name__ == "__main__":
    run_migrations()
    print("Migrations completed.")
