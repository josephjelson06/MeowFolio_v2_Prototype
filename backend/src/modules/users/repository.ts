import type { QueryResultRow } from 'pg';
import { pool } from '../../db/pool';

export interface StoredUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  googleSub: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapRow(row: QueryResultRow): StoredUser {
  return {
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at.toISOString(),
    email: row.email ?? null,
    googleSub: row.google_sub ?? null,
    id: row.id,
    name: row.name ?? null,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getUserById(id: string) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getUserByEmail(email: string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function getDefaultDevUser() {
  return getUserByEmail('demo@resumeai.local');
}
