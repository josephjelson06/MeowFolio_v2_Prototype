# Refactor Task List

Last updated: 2026-03-31

React migration planning now lives in [react_implementation_plan.md](./react_implementation_plan.md).

React implementation is now underway in [react_app](./react_app).

## Completed

- [x] Remove the old device-toggle simulation from active pages.
- [x] Make active pages respond to real viewport width instead of a fake shell preview.
- [x] Update shared theme tokens and global styles to the new light tactile system.
- [x] Fix major shared layout issues from the audit:
  - undefined body text token
  - fixed editor/JD heights
  - ATS drawer transform behavior
  - dashboard wrapping on narrow desktops
  - mobile bottom-sheet width conflict
  - shared button/input disabled states
- [x] Tighten page CSS/JS bundles so active pages do not all load every page asset.
- [x] Centralize the public auth modal in [js/auth.js](./js/auth.js).
- [x] Remove duplicated auth modal HTML from:
  - [index.html](./index.html)
  - [about.html](./about.html)
  - [404.html](./404.html)
  - [500.html](./500.html)
- [x] Convert active pages away from dual desktop/mobile content DOM.
  - [x] Dashboard
  - [x] Resumes
  - [x] Editor
  - [x] JDs
  - [x] Profile
  - [x] Home
  - [x] About
  - [x] 404
  - [x] 500
- [x] Centralize shared public chrome in [js/auth.js](./js/auth.js):
  - desktop nav
  - mobile topbar + section links
  - public footer
- [x] Centralize standard workspace chrome in [js/app.js](./js/app.js):
  - desktop nav for Dashboard, Resumes, JDs, and Profile
  - mobile topbar for Dashboard, Resumes, JDs, and Profile
  - mobile bottom bar for Dashboard, Resumes, JDs, and Profile
- [x] Extend shared workspace chrome to [editor.html](./editor.html) in [js/app.js](./js/app.js):
  - desktop nav
  - custom mobile topbar variant
  - mobile bottom bar
- [x] Centralize the shared resume modal shell in [js/modal.js](./js/modal.js) for:
  - [dashboard.html](./dashboard.html)
  - [resumes.html](./resumes.html)
- [x] Remove inline `onclick` / `onchange` / `oninput` handlers from active pages:
  - editor
  - dashboard
  - resumes
  - JDs
  - profile
  - home
  - about
  - 404
  - 500
- [x] Remove inline `style=` attributes from the active page HTML files.
- [x] Introduce a thin shared mock data layer in [js/data.js](./js/data.js) for:
  - resume library seeds
  - JD library seeds
  - resume match profiles
  - dashboard tips

## In Progress

- [x] Reduce remaining inline style clusters and decorative hardcoded values.

## Remaining Structural Work

- [x] Replace large inline style clusters with CSS classes.
- [x] Do a browser-based responsive QA pass after the first single-DOM conversions land.
- [x] Archive or remove the old monolithic prototype file once the split app no longer needs it for reference.

## Notes

- All active pages now use the single-DOM responsive pattern.
- Standard public chrome and standard workspace chrome are now shared.
- Inline DOM event handlers are now removed from the active split pages.
- Active page HTML files no longer use inline `style=` attributes.
- Resume library, JD library, resume match profiles, and dashboard tips now come from a shared mock data source in [js/data.js](./js/data.js).
- Screenshot-based QA was run across the active desktop/mobile pages using a headless local browser, followed by desktop containment/scale fixes on the editor and JD pages.
- The old monolithic `resumeai_full_prototype.html` file has been removed so the split app is the only active source of truth.
