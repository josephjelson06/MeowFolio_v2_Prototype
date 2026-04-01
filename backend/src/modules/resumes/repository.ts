import { randomUUID } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import type { RenderOptions, ResumeData, ResumeSource } from '../../../../shared/contracts/resume';
import { pool } from '../../db/pool';
import { formatRelativeTime } from '../../lib/formatters';

export interface StoredResume {
  id: string;
  title: string;
  source: ResumeSource;
  templateId: string;
  content: ResumeData;
  renderOptions: RenderOptions;
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: QueryResultRow): StoredResume {
  return {
    content: row.content_json as ResumeData,
    createdAt: row.created_at.toISOString(),
    id: row.id,
    rawText: row.raw_text ?? '',
    renderOptions: row.render_options_json as RenderOptions,
    source: row.source as ResumeSource,
    templateId: row.template_id,
    title: row.title,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function countResumes(userId?: string) {
  const result = userId
    ? await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM resumes WHERE user_id = $1', [userId])
    : await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM resumes');
  return Number(result.rows[0]?.count ?? 0);
}

export async function listResumes(userId?: string) {
  const result = userId
    ? await pool.query('SELECT * FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC, created_at DESC', [userId])
    : await pool.query('SELECT * FROM resumes ORDER BY updated_at DESC, created_at DESC');
  return result.rows.map(mapRow);
}

export async function getResumeById(id: string, userId?: string) {
  const result = userId
    ? await pool.query('SELECT * FROM resumes WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId])
    : await pool.query('SELECT * FROM resumes WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function createResume(input: {
  userId?: string | null;
  title: string;
  source: ResumeSource;
  templateId: string;
  content: ResumeData;
  renderOptions: RenderOptions;
  rawText?: string;
}) {
  const id = randomUUID();
  const result = await pool.query(
    `INSERT INTO resumes (id, user_id, title, source, template_id, content_json, render_options_json, raw_text)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
     RETURNING *`,
    [id, input.userId ?? null, input.title, input.source, input.templateId, JSON.stringify(input.content), JSON.stringify(input.renderOptions), input.rawText ?? ''],
  );
  return mapRow(result.rows[0]);
}

export async function updateResume(id: string, input: Partial<{
  title: string;
  templateId: string;
  content: ResumeData;
  renderOptions: RenderOptions;
  rawText: string;
}>, userId?: string) {
  const current = await getResumeById(id, userId);
  if (!current) return null;

  const result = userId
    ? await pool.query(
        `UPDATE resumes
           SET title = $2,
               template_id = $3,
               content_json = $4::jsonb,
               render_options_json = $5::jsonb,
               raw_text = $6,
               updated_at = NOW()
         WHERE id = $1 AND user_id = $7
         RETURNING *`,
        [
          id,
          input.title ?? current.title,
          input.templateId ?? current.templateId,
          JSON.stringify(input.content ?? current.content),
          JSON.stringify(input.renderOptions ?? current.renderOptions),
          input.rawText ?? current.rawText,
          userId,
        ],
      )
    : await pool.query(
        `UPDATE resumes
           SET title = $2,
               template_id = $3,
               content_json = $4::jsonb,
               render_options_json = $5::jsonb,
               raw_text = $6,
               updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          id,
          input.title ?? current.title,
          input.templateId ?? current.templateId,
          JSON.stringify(input.content ?? current.content),
          JSON.stringify(input.renderOptions ?? current.renderOptions),
          input.rawText ?? current.rawText,
        ],
      );
  return mapRow(result.rows[0]);
}

export async function deleteResume(id: string, userId?: string) {
  const result = userId
    ? await pool.query('DELETE FROM resumes WHERE id = $1 AND user_id = $2', [id, userId])
    : await pool.query('DELETE FROM resumes WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export function toResumeSummary(resume: StoredResume, recent = false) {
  return {
    id: resume.id,
    name: resume.title,
    recent,
    template: resume.templateId,
    updated: formatRelativeTime(resume.updatedAt),
    updatedAt: resume.updatedAt,
  };
}
