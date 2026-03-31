# Refactor Task List

Last updated: 2026-03-31

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

## In Progress

- [ ] Reduce remaining page-specific chrome duplication where it is still workflow-specific:
  - [ ] editor-specific header / mobile controls
  - [ ] shared modal shell patterns

## Remaining Structural Work

- [ ] Replace large inline style clusters with CSS classes.
- [ ] Replace as many inline `onclick` / `onchange` handlers as practical with cleaner hooks.
- [ ] Introduce a thin data/service layer in front of mock data files.
- [ ] Do a browser-based responsive QA pass after the first single-DOM conversions land.
- [ ] Archive or remove [resumeai_full_prototype.html](./resumeai_full_prototype.html) once the split app no longer needs it for reference.

## Notes

- All active pages now use the single-DOM responsive pattern.
- Standard public chrome and standard workspace chrome are now shared.
- The next biggest cleanup target before a cleaner React/Next migration is the remaining inline handlers/styles plus a few workflow-specific shells.
