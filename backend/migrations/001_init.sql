CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  google_sub TEXT UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  template_id TEXT NOT NULL,
  content_json JSONB NOT NULL,
  render_options_json JSONB NOT NULL,
  raw_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_descriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT,
  type TEXT NOT NULL DEFAULT 'Imported',
  badge TEXT NOT NULL DEFAULT 'Newly added',
  raw_text TEXT NOT NULL,
  parsed_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON resumes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_updated_at ON job_descriptions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_owner ON uploads(owner_type, owner_id);
