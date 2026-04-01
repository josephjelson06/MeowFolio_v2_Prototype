# Backend Implementation Task List

Last updated: 2026-04-01
Status: Backend implemented, built runtime verified locally, with live editor/JD flows, auth-ready ownership seams, dev session bootstrap, and TeX export working
Primary tracker for the Express backend, shared contracts, and React API integration.

## Foundation

- [x] Lock backend direction: Express + TypeScript + Postgres JSONB + Groq resume parsing.
- [x] Lock v1 scoring direction: ATS and JD matching stay rule-based.
- [x] Lock validation direction: no Zod in the v1 runtime path.
- [x] Create backend scaffold and scripts.
- [x] Create shared contract layer for canonical resume, JD, template, and profile data.
- [x] Create backend env/config loading and error handling.

## Persistence And Domain

- [x] Add SQL migrations for users, resumes, job_descriptions, uploads, and generated_documents.
- [x] Add repositories for resumes, JDs, uploads, and generated docs.
- [x] Add user repository helpers for the demo/dev session path.
- [x] Add canonical resume normalizer with flexible optional-field handling.
- [x] Add template registry based on the 5 preview images and TeX template definitions.
- [x] Seed demo data for resumes, JDs, profile usage, and dashboard tips.

## Import And Scoring

- [x] Add text extraction for PDF, DOCX, TXT, and MD uploads.
- [x] Add Groq client and resume parse prompt flow.
- [x] Add resume import pipeline with partial/failure fallback.
- [x] Add JD import pipeline for paste/upload flows.
- [x] Add ATS scoring service.
- [x] Add JD matching service.

## API

- [x] Add health endpoint.
- [x] Add session endpoint for the current demo actor/bootstrap path.
- [x] Add templates endpoint.
- [x] Add resume CRUD endpoints.
- [x] Add JD CRUD endpoints.
- [x] Add resume import and JD import endpoints.
- [x] Add ATS score and JD score endpoints.
- [x] Add TeX export endpoint for saved resumes.
- [x] Add profile and tips endpoints for current React consumers.
- [x] Add auth-ready ownership scoping seam with optional `user_id` filtering and `x-user-id` request support.

## React Integration

- [x] Add API client layer in React.
- [x] Add dev session bootstrap so React consistently sends the actor header.
- [x] Replace resume mock service with backend-backed service.
- [x] Replace JD mock service with backend-backed service.
- [x] Replace profile and tips mock services with backend-backed services.
- [x] Replace hardcoded template metadata in React with backend-driven template records.
- [x] Update modal flows for blank resume creation and import/upload actions.
- [x] Keep localStorage limited to temporary draft recovery helpers.
- [x] Wire editor record loading to `GET /api/resumes/:id`.
- [x] Wire editor autosave to `PATCH /api/resumes/:id`.
- [x] Wire editor ATS analysis to `POST /api/resumes/:id/ats-score`.
- [x] Persist editor section order and custom sections through the live resume document save path.
- [x] Stabilize JD route library sync and analysis flow against backend-backed services.
- [x] Wire resume download to real TeX export instead of placeholder text download.

## Verification

- [x] Install backend dependencies and build cleanly.
- [x] Run migrations and seed demo data.
- [x] Verify backend endpoints manually.
- [x] Verify React app still builds after service migration.
- [x] Verify the built backend runtime starts cleanly with `node dist/backend/src/index.js`.
- [x] Verify ownership-scoped smoke tests with the seeded demo user header.
- [x] Verify session bootstrap and TeX export endpoints on the built backend runtime.
- [x] Update this tracker with completed and remaining work after each implementation slice.

## Local Runtime Notes

- [x] Provision local Postgres dev credentials and database:
  - database: `resumeai`
  - user: `resumeai`
- [x] Wire `.env.local` to the local backend/runtime defaults.
- [x] Smoke-test completed:
  - `GET /api/health`
  - `GET /api/templates`
  - `GET /api/resumes`
  - `GET /api/jds`
  - resume create/delete round-trip
  - ATS score
  - JD match score
