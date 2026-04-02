# V1 to V2 Design Migration

Goal: absorb the core MeowFolio v1 visual language from `Pages/` into the current React app in `react_app/`, while preserving the stronger v2 architecture, responsive behavior, and protected editor/JD layouts.

## Guardrails

- Preserve current page structure and route architecture.
- Preserve desktop/mobile layout logic from v2.
- Preserve `EditorPage` and `JdsPage` structure/layout.
- Port design language, not markup architecture.
- After migration, v2 remains the only active product base.

## V1 Design Primitives Extracted

- Warm cream background with dotted paper texture
- Tactile card borders and offset shadows
- Plus Jakarta Sans + Inter hierarchy
- Coral / lavender / mint accent system
- Rounded shells and paper-card resume surfaces
- Chunkier pill buttons and badges
- Sticky translucent top nav feel
- Stronger editorial spacing on public pages

## Task List

- [x] Audit `Pages/` for visual primitives and migration-safe targets
- [x] Create migration tracker
- [x] Rename visible brand from `resumeai` to `meowfolio`
- [x] Apply shared meowfolio theme treatment to tokens / globals / buttons / cards / nav
- [x] Port v1 visual language into public pages without changing page structure
- [x] Port v1 visual language into safe workspace pages (`Dashboard`, `Resumes`, `Profile`) without changing page structure
- [x] Keep `Editor` and `JDs` layouts intact while inheriting only safe shared theme changes
- [x] Build and verify the React app after migration slice

## Notes

- `Pages/` acts as design donor only.
- `react_app/` remains the implementation source of truth.
- `EditorPage` and `JdsPage` were intentionally not structurally rewritten in this slice.
- Shared theme changes were allowed to flow into protected pages only where they did not alter layout structure.
- `Home`, `About`, `404`, and `500` now all use the meowfolio public visual language while keeping the v2 route/layout architecture.
- Safe workspace routes (`Dashboard`, `Resumes`, `Profile`) carry the same shared tactile theme treatment without structural rewrites.
- The remaining `resumeai` strings in the React app are legacy storage keys kept only for migration compatibility.
