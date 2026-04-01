import { randomUUID } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import type { JdParsedMeta, JdRecord } from '../../../../shared/contracts/jd';
import { pool } from '../../db/pool';
import { formatRelativeTime } from '../../lib/formatters';

export interface StoredJd {
  id: string;
  title: string;
  company: string;
  type: string;
  badge: string;
  rawText: string;
  parsedMeta: JdParsedMeta;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: QueryResultRow): StoredJd {
  return {
    badge: row.badge,
    company: row.company ?? '',
    createdAt: row.created_at.toISOString(),
    id: row.id,
    parsedMeta: row.parsed_json as JdParsedMeta,
    rawText: row.raw_text,
    title: row.title,
    type: row.type,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function countJds(userId?: string) {
  const result = userId
    ? await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM job_descriptions WHERE user_id = $1', [userId])
    : await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM job_descriptions');
  return Number(result.rows[0]?.count ?? 0);
}

export async function listJds(userId?: string) {
  const result = userId
    ? await pool.query('SELECT * FROM job_descriptions WHERE user_id = $1 ORDER BY updated_at DESC, created_at DESC', [userId])
    : await pool.query('SELECT * FROM job_descriptions ORDER BY updated_at DESC, created_at DESC');
  return result.rows.map(mapRow);
}

export async function getJdById(id: string, userId?: string) {
  const result = userId
    ? await pool.query('SELECT * FROM job_descriptions WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId])
    : await pool.query('SELECT * FROM job_descriptions WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createJd(input: {
  userId?: string | null;
  title: string;
  company: string;
  type?: string;
  badge?: string;
  rawText: string;
  parsedMeta: JdParsedMeta;
}) {
  const id = randomUUID();
  const result = await pool.query(
    `INSERT INTO job_descriptions (id, user_id, title, company, type, badge, raw_text, parsed_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     RETURNING *`,
    [id, input.userId ?? null, input.title, input.company, input.type ?? 'Imported', input.badge ?? 'Newly added', input.rawText, JSON.stringify(input.parsedMeta)],
  );
  return mapRow(result.rows[0]);
}

export async function updateJd(id: string, input: Partial<{
  title: string;
  company: string;
  type: string;
  badge: string;
  rawText: string;
  parsedMeta: JdParsedMeta;
}>, userId?: string) {
  const current = await getJdById(id, userId);
  if (!current) return null;

  const result = userId
    ? await pool.query(
        `UPDATE job_descriptions
           SET title = $2,
               company = $3,
               type = $4,
               badge = $5,
               raw_text = $6,
               parsed_json = $7::jsonb,
               updated_at = NOW()
         WHERE id = $1 AND user_id = $8
         RETURNING *`,
        [
          id,
          input.title ?? current.title,
          input.company ?? current.company,
          input.type ?? current.type,
          input.badge ?? current.badge,
          input.rawText ?? current.rawText,
          JSON.stringify(input.parsedMeta ?? current.parsedMeta),
          userId,
        ],
      )
    : await pool.query(
        `UPDATE job_descriptions
           SET title = $2,
               company = $3,
               type = $4,
               badge = $5,
               raw_text = $6,
               parsed_json = $7::jsonb,
               updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          id,
          input.title ?? current.title,
          input.company ?? current.company,
          input.type ?? current.type,
          input.badge ?? current.badge,
          input.rawText ?? current.rawText,
          JSON.stringify(input.parsedMeta ?? current.parsedMeta),
        ],
      );
  return mapRow(result.rows[0]);
}

export async function deleteJd(id: string, userId?: string) {
  const result = userId
    ? await pool.query('DELETE FROM job_descriptions WHERE id = $1 AND user_id = $2', [id, userId])
    : await pool.query('DELETE FROM job_descriptions WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export function toJdRecord(jd: StoredJd): JdRecord {
  return {
    badge: jd.badge,
    company: jd.company,
    id: jd.id,
    parsedMeta: jd.parsedMeta,
    parsedText: jd.rawText,
    title: jd.title,
    type: jd.type,
    updatedAt: formatRelativeTime(jd.updatedAt),
  };
}
