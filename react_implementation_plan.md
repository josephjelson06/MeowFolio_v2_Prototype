# React Implementation Plan

Last updated: 2026-04-01
Status: React routes stabilized and live backend integration is running locally across the main workspace flows, including dev session bootstrap and TeX-backed export
Primary tracker for the React conversion phase.

## Purpose

- Convert the cleaned static prototype into a React app without losing the current visual baseline.
- Preserve the current design system, responsive behavior, and shared shells while removing page-level HTML duplication.
- Set up parent-child component boundaries cleanly enough that future backend/API work does not require another major refactor.

## Current Preconditions

- [x] Static HTML prototype cleaned and stabilized.
- [x] Shared chrome centralized in the static version.
- [x] Shared mock data layer exists in [js/data.js](./js/data.js).
- [x] Legacy monolith removed.
- [x] Responsive QA pass completed on the static baseline.

## Working Assumptions

- Use `React + TypeScript`.
- Use `React Router` for the first migration pass.
- Keep route and layout boundaries compatible with a later `Next app router` move if needed.
- Preserve the current visual system first; do not redesign during migration.
- Keep CSS token names and shared style layers as close as possible to the current prototype to reduce churn.

## Source Of Truth Rules During Migration

- The current static pages remain the visual and behavior reference until each React route is signed off.
- This file is the living implementation tracker for the conversion phase.
- [refactor_task_list.md](./refactor_task_list.md) remains the record of pre-React cleanup work already completed.
- Do not delete the static page equivalent of a route until the React version reaches parity.
- The active React workspace lives in [react_app](./react_app), so migration work can proceed without destabilizing the static prototype baseline.

## Target App Structure

```text
react_app/
  public/
    Images/
  src/
  app/
    App.tsx
    router.tsx
    providers/
      AppProviders.tsx
      UiProvider.tsx
  layouts/
    RootLayout.tsx
    PublicLayout.tsx
    WorkspaceLayout.tsx
    EditorLayout.tsx
  pages/
    public/
      HomePage.tsx
      AboutPage.tsx
      NotFoundPage.tsx
      Error500Page.tsx
    workspace/
      DashboardPage.tsx
      ResumesPage.tsx
      JdsPage.tsx
      EditorPage.tsx
      ProfilePage.tsx
  components/
    ui/
      Button.tsx
      Badge.tsx
      Card.tsx
      PageSection.tsx
      Pagination.tsx
      ProgressBar.tsx
      EmptyState.tsx
    public/
      PublicHeader.tsx
      PublicFooter.tsx
      StoryRail.tsx
      TemplateRail.tsx
      FaqList.tsx
    workspace/
      WorkspaceHeader.tsx
      WorkspaceTopbar.tsx
      WorkspaceBottomNav.tsx
      KpiCard.tsx
      ResumeCard.tsx
      QuickActionCard.tsx
    editor/
      EditorTabs.tsx
      SectionNav.tsx
      EditorFormPane.tsx
      TemplatePane.tsx
      ToolbarPane.tsx
      PdfPreview.tsx
      AtsDrawer.tsx
      AtsFullReport.tsx
    jds/
      JdListPane.tsx
      ResumePickerPane.tsx
      JdResultPane.tsx
      JdMobileSheet.tsx
  modals/
    AuthModalHost.tsx
    ResumeModalHost.tsx
    JdModalHost.tsx
  hooks/
    useAuthModal.ts
    useResumeModal.ts
    useViewportMode.ts
    usePagination.ts
  services/
    resumeService.ts
    jdService.ts
    profileService.ts
    tipsService.ts
  mocks/
    resumeLibrary.ts
    jdLibrary.ts
    resumeMatchProfiles.ts
    dashboardTips.ts
  state/
    ui/
      uiContext.tsx
    editor/
      editorState.ts
    jds/
      jdState.ts
  lib/
    routes.ts
    formatters.ts
    constants.ts
  styles/
    tokens.css
    globals.css
    layout.css
    components.css
    public.css
    dashboard.css
    resumes.css
    editor.css
    jds.css
    profile.css
  types/
    resume.ts
    jd.ts
    ui.ts
```

## Parent-Child Structure Rules

- `App -> AppProviders -> Router -> Layout -> Page -> Feature Components -> UI Primitives`.
- `RootLayout` owns app-wide background, font loading, and any global modal portal/root elements.
- `PublicLayout` owns public header, public footer, auth modal access points, and public page width rules.
- `WorkspaceLayout` owns desktop workspace nav, mobile topbar, mobile bottom nav, and shared workspace page spacing.
- `EditorLayout` is a route-specific nested layout because the editor has its own breadcrumb, mode toggles, dual-pane workspace, and ATS surfaces.
- `Page` components orchestrate data and page-scoped state only; they should not own shared chrome.
- `Feature` components compose page sections and can hold local interaction state, but should not fetch unrelated route data.
- `UI` primitives stay dumb and reusable; they should not know about resumes, JDs, or editor-specific business rules.
- `ModalHost` components own modal markup and focus/escape/backdrop handling; pages trigger them through hooks or context.
- `Mobile` and `desktop` views must remain one React tree per route; no duplicate page DOMs for breakpoint variants.

## Layout Ownership Rules

- Layouts own spacing, safe-area padding, viewport-height handling, and shared navigation chrome.
- Pages own route-specific section ordering and route-specific empty states.
- Feature components own section internals.
- Shared shells must never import page-specific mock data directly.
- Route transitions should happen through router links/navigation helpers, not through hardcoded `window.location` calls.

## State And Data Boundaries

- `services/` becomes the only read/write boundary for page data.
- `mocks/` provides seed data during the React phase until real APIs exist.
- `uiContext` should only hold globally shared UI state such as auth modal, resume modal, and shared overlays.
- `editor` state stays page-scoped unless another route truly needs it.
- `jds` state can be page-scoped at first, then promoted only if cross-route sharing becomes necessary.
- Pagination state should stay local to the page hooks.
- Derived display metrics belong in helpers/selectors, not inline inside components.
- No component should read from the DOM to derive state.

## Route Map To Build

- `/` -> `HomePage` inside `PublicLayout`
- `/about` -> `AboutPage` inside `PublicLayout`
- `/404` -> `NotFoundPage` inside `PublicLayout`
- `/500` -> `Error500Page` inside `PublicLayout`
- `/dashboard` -> `DashboardPage` inside `WorkspaceLayout`
- `/resumes` -> `ResumesPage` inside `WorkspaceLayout`
- `/jds` -> `JdsPage` inside `WorkspaceLayout`
- `/editor` -> `EditorPage` inside `EditorLayout`
- `/profile` -> `ProfilePage` inside `WorkspaceLayout`

## Migration Strategy

### Phase 0 - Foundation

- [x] Initialize the React + TypeScript app shell.
- [x] Add routing, providers, and the base `src/` folder structure.
- [x] Move static assets into the React app asset structure.
- [x] Copy the current token/global/layout CSS into `src/styles`.
- [x] Wire the app entry so the current design system renders before any route work starts.

### Phase 1 - Shared Design System

- [x] Port the token layer from [css/tokens.css](./css/tokens.css).
- [x] Port the global layer from [css/globals.css](./css/globals.css).
- [x] Port the shared layout layer from [css/layout.css](./css/layout.css).
- [x] Port the shared component layer from [css/components.css](./css/components.css).
- [x] Build the first reusable primitives: button, badge, card, pagination, progress bar, empty state.
- [ ] Confirm that the primitive components can reproduce current static styling without custom page hacks.

### Phase 2 - Layouts And Modal Hosts

- [x] Build `RootLayout`.
- [x] Build `PublicLayout`.
- [x] Build `WorkspaceLayout`.
- [x] Build `EditorLayout`.
- [x] Build `AuthModalHost`.
- [x] Build `ResumeModalHost`.
- [x] Build `JdModalHost`.
- [x] Move shared nav/footer/modal behavior out of page components and into layout/host components.

### Phase 3 - Mock Services And Types

- [x] Move [js/data.js](./js/data.js) into typed mock modules under `src/mocks`.
- [x] Create `resumeService`.
- [x] Create `jdService`.
- [x] Create `profileService`.
- [x] Create `tipsService`.
- [x] Add shared TypeScript types for resumes, JDs, report metrics, and UI state.
- [x] Replace direct page-script data access with service calls and selectors.

### Phase 4 - Public Routes

- [x] Build `HomePage`.
- [x] Build `AboutPage`.
- [x] Build `NotFoundPage`.
- [x] Build `Error500Page`.
- [x] Recreate public rails, FAQ, and auth entry behavior in React.
- [x] Verify public routes inherit only `PublicLayout` concerns and no workspace-specific state.

### Phase 5 - Workspace Core Routes

- [x] Build `DashboardPage`.
- [x] Build `ResumesPage`.
- [x] Build `ProfilePage`.
- [x] Recreate dashboard tips rotation in React.
- [x] Recreate resume pagination, rename, download, delete, and create modal flow in React.
- [x] Confirm `WorkspaceLayout` fully owns shared nav/mobile bars for these routes.

### Phase 6 - JD Route

- [x] Build `JdsPage`.
- [x] Build JD list pane, picker pane, result pane, report sheet, and JD modal as separate feature components.
- [x] Move JD report calculations into helpers/selectors.
- [x] Keep mobile report sheet behavior route-local and controlled by React state.
- [x] Confirm no duplicated desktop/mobile DOM is introduced.

### Phase 7 - Editor Route

- [x] Build `EditorPage` under `EditorLayout`.
- [x] Build section tabs, template pane, toolbar pane, preview pane, ATS drawer, and ATS full report as separate components.
- [x] Move editor mode, section selection, and slider state to route-local React state/hooks.
- [x] Preserve the current mobile edit/preview/ATS experience without DOM toggling hacks.
- [x] Confirm the editor route does not leak editor-specific chrome into the other workspace pages.

### Phase 8 - QA, Parity, And Freeze

- [x] Run desktop/mobile screenshot QA on all React routes.
- [x] Compare route output against the static source-of-truth pages.
- [x] Fix spacing, overflow, and responsive regressions.
- [x] Verify keyboard/focus behavior for modals, drawers, tabs, and pagination.
- [x] Confirm each route is using shared layout/components instead of page-local duplication.
- [x] Freeze the React mock-data baseline before backend integration begins.

## Definition Of Done Per Route

- [ ] Route is rendered from React with one component tree only.
- [ ] Route uses the correct layout instead of duplicating chrome.
- [ ] Route behavior matches the static prototype at desktop and mobile sizes.
- [ ] Route data comes through services or typed mock modules, not inline page constants.
- [ ] Route contains no direct DOM query/manipulation for ordinary UI state.
- [ ] Route is covered by screenshot QA.

## Risks To Watch

- Over-centralizing too early and making layouts own page logic.
- Reintroducing duplicated desktop/mobile trees in React components.
- Letting page components import from each other directly.
- Keeping mock calculations embedded in JSX instead of moving them into helpers.
- Mixing modal ownership between layouts and pages.
- Starting API work before route/component boundaries settle.

## Update Protocol

- Update `Last updated` whenever meaningful migration work lands.
- Mark completed tasks here immediately after code is merged into the React branch/workspace.
- Add a short note under `Current focus` whenever the active phase changes.
- Add blockers here instead of burying them in chat.
- Keep this file as the canonical React conversion tracker going forward.

## Current Focus

- React app shell is live in [react_app](./react_app).
- Dashboard, resume-library, JD, editor, profile, and public routes now use the static class rhythm more directly inside React.
- Editor-specific mobile chrome now lives at the editor route boundary instead of inside shared workspace layout.
- Responsive QA has been run across the React routes using screenshot verification against the routed app.
- The first shared regression from that pass has been fixed: desktop `gnav` no longer overlaps the mobile workspace/public chrome on narrow widths.
- The second shared regression batch is also fixed: mobile bottom sheets on editor/JD routes no longer render open by default, and mobile topbar controls now shrink more safely.
- The current responsive QA pass has also produced route-level mobile fixes for:
  - dashboard KPI and middle-section stacking
  - narrower public hero/story containment
  - editor tab/toggle compression
  - JD workspace tab and action compression
- Additional inspection against rendered page widths confirmed that the last suspicious public/resume/JD/editor mobile screenshots were not caused by real page-wide overflow, only by narrow control clusters and capture quirks.
- Backend integration is now live locally:
  - shared API client is active
  - resume/JD/profile/tips services are backend-backed
  - editor route now loads full resume records from the backend
  - editor route autosaves to the backend and runs live ATS scoring
- React now bootstraps a dev session actor before rendering route flows, so the frontend consistently exercises the backend ownership seam.
- Public and editor template selectors now use backend-driven template metadata instead of duplicate hardcoded template lists.
- Resume download now uses the live backend TeX export path instead of a placeholder text stub.
- Editor persistence now also covers section ordering and custom sections through the canonical resume document save path.
- JD route synchronization has been tightened so library refreshes and report state behave predictably against the live backend.
- Backend-ready ownership preparation is in place through optional `user_id` scoping and `x-user-id` request support.
- Current focus: move from local integration completeness into the next backend phase, especially auth preparation hardening, richer preview/export polish, and eventual PDF compile wiring on top of the TeX export path.
