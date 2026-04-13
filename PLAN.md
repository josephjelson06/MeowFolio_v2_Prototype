# Frontend-First Cleanup Plan

## Summary
Refactor the repo so it cleanly becomes `backend/` and `frontend/`, then make the frontend self-contained, easier to navigate, and safer to restyle. The implementation will keep mocked data where needed, preserve the current UX flows, and focus on shared UI foundations, shared page shells, and breaking down the largest page files without changing backend scope.

## Key Changes
### 1. Repo and boundary cleanup
- Rename `react_app/` to `frontend/`.
- Treat `frontend/` as the only place for frontend code and assets.
- Keep `backend/` untouched.
- Frontend must stop importing from repo-root `shared/`, `lib/`, or `types/`.
- `frontend/src/types` becomes the only frontend type source.
- Keep top-level `shared/`, root `lib/`, and root `types/` as non-frontend infrastructure for now, but do not grow frontend dependencies on them.

### 2. Final frontend structure
- Keep frontend organized under:
  - `src/app/` for app bootstrap, router, root shells
  - `src/components/ui/` for reusable primitives
  - `src/components/public/` for pre-auth shared layout/chrome
  - `src/components/workspace/` for post-auth shared layout/chrome
  - `src/pages/public/...` and `src/pages/workspace/...` with page-local `components/`, `hooks/`, `utils/`, `data.ts` only where useful
  - `src/services/` for mock/backend-boundary logic
  - `src/state/` only for true global state
  - `src/types/` for frontend contracts
- Keep `src/main.tsx`, `src/app/App.tsx`, and router small.
- Move route constants under `src/app/router/` and API client under `src/services/api/`.

### 3. Shared UI foundations
- Standardize a minimal design system only:
  - `Button`
  - `Badge`
  - `Card`
  - `Input`
  - `Textarea`
  - `Select`
  - `ModalShell`
  - `EmptyState`
  - `SectionHeading`
- Extract shared pre-auth components:
  - `PublicLayout`
  - `PublicHeader`
  - `PublicFooter`
  - optional `PublicStatusPage`
- Extract shared post-auth components:
  - `WorkspaceShell`
  - workspace top nav
  - mobile nav
  - workspace header/topbar
- Page-specific copy and behavior must stay inside the page or page-local components.

### 4. Page refactor rules
- Public pages:
  - keep page-specific content and data in each page
  - move duplicated header/footer/button/pill/layout code into shared public components
- Workspace pages:
  - keep page-specific behavior in each page
  - move duplicated shell/nav/badge/action/layout code into shared workspace components
- `EditorPage` becomes orchestration-only:
  - keep route-level state, save/load, mode switching, and ATS trigger flow there
  - move editor UI sections, toolbar, template pane, preview, ATS panels, and helper logic into page-local `components/`, `hooks/`, and `utils/`
- Keep 404/500 as public pages for now.

### 5. Data, services, and state decisions
- Keep mocked data for dashboard, resumes, JDs, profile, ATS, JD analysis, and template previews.
- Keep real frontend flows, navigation, forms, responsiveness, and modal behavior.
- Keep the current `sessionService` and `sessionContext` as the frontend auth/session boundary; swap implementation later when backend auth is ready.
- Keep mock/fallback behavior in `services/`, not in pages.
- Remove or fold tiny unused state files that do not hold real shared state.

## Important Interface Decisions
- Frontend type source of truth: `frontend/src/types`.
- No frontend imports from top-level `shared/contracts`.
- Services remain the boundary for resume, JD, profile, template, tips, and session data.
- Session stays as a provider/service abstraction, not a temporary hack to delete later.
- Template screenshots remain visual-only assets; rendered PDF correctness is not part of this frontend cleanup phase.

## Test Plan
- Verify all routes still render and navigate correctly on desktop and mobile.
- Verify public pages share one consistent shell and workspace pages share one consistent shell.
- Verify modal flows still work:
  - auth modal
  - create/import resume modal
  - add JD modal
- Verify mocked data still drives the same visible UX for dashboard, resumes, JDs, profile, ATS, and editor.
- Verify `EditorPage` still supports:
  - loading a resume
  - editing content
  - switching tabs/modes
  - autosave/mock save state
  - ATS mocked analysis flow
- Verify no frontend file imports from repo-root `shared/`, `lib/`, or `types`.
- Verify responsive behavior across public and workspace pages remains intact after extraction.

## Assumptions and Defaults
- Backend implementation is explicitly out of scope for this phase.
- Mocked data stays until each backend feature is ready.
- UI/UX quality and maintainability are the primary goals, not scaling architecture.
- The target is a polished v1 frontend that convincingly mimics the real product on desktop and mobile.
- The refactor should simplify navigation and future edits, not introduce a heavy or over-engineered system.
