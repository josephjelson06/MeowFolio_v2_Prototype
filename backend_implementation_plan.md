# Backend Implementation Task List

Last updated: 2026-04-01
Status: Backend and React integration implemented, runtime DB verification blocked by local Postgres credentials
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
- [x] Add templates endpoint.
- [x] Add resume CRUD endpoints.
- [x] Add JD CRUD endpoints.
- [x] Add resume import and JD import endpoints.
- [x] Add ATS score and JD score endpoints.
- [x] Add profile and tips endpoints for current React consumers.

## React Integration

- [x] Add API client layer in React.
- [x] Replace resume mock service with backend-backed service.
- [x] Replace JD mock service with backend-backed service.
- [x] Replace profile and tips mock services with backend-backed services.
- [x] Update modal flows for blank resume creation and import/upload actions.
- [x] Keep localStorage limited to temporary draft recovery helpers.

## Verification

- [x] Install backend dependencies and build cleanly.
- [ ] Run migrations and seed demo data.
  Blocked right now by local Postgres auth failure for the default `postgres` user.
- [ ] Verify backend endpoints manually.
  Pending a working `DATABASE_URL`.
- [x] Verify React app still builds after service migration.
- [x] Update this tracker with completed and remaining work after each implementation slice.

## Current Blocker

- [ ] Set a working `DATABASE_URL` in `.env.local` for the local Postgres instance, then re-run:
  - `npm run migrate`
  - `npm run seed`
  - backend health/API smoke test
