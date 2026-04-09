# UI Audit Report

Date: 2026-04-09

Scope: `react_app/src`

This scout focused on the actual files controlling layout, spacing, shell styling, and repeated UI patterns. The goal was not to fix the UI yet, but to produce a concrete map you can hand to an AI editor before starting a multi-file refactor.

## 1. Repo Map

- Layouts:
  - `react_app/src/layouts/PublicLayout.tsx`
  - `react_app/src/layouts/WorkspaceLayout.tsx`
  - `react_app/src/layouts/EditorLayout.tsx`
  - `react_app/src/layouts/RootLayout.tsx`
- Public pages:
  - `react_app/src/pages/public/HomePage.tsx`
  - `react_app/src/pages/public/AboutPage.tsx`
  - `react_app/src/pages/public/NotFoundPage.tsx`
  - `react_app/src/pages/public/Error500Page.tsx`
- Workspace pages:
  - `react_app/src/pages/workspace/DashboardPage.tsx`
  - `react_app/src/pages/workspace/ResumesPage.tsx`
  - `react_app/src/pages/workspace/ProfilePage.tsx`
  - `react_app/src/pages/workspace/JdsPage.tsx`
  - `react_app/src/pages/workspace/EditorPage.tsx`
- Shared UI primitives:
  - `react_app/src/components/ui/Button.tsx`
  - `react_app/src/components/ui/Badge.tsx`
  - `react_app/src/components/ui/Card.tsx`
  - `react_app/src/components/ui/PageSection.tsx`
  - `react_app/src/components/ui/Pagination.tsx`
- Public-specific helpers:
  - `react_app/src/components/public/publicStyles.ts`
  - `react_app/src/components/public/PublicHeader.tsx`
  - `react_app/src/components/public/PublicFooter.tsx`
  - `react_app/src/components/public/PublicSection.tsx`
- Shared token/theme layer:
  - `react_app/src/styles/tokens.css`
  - `react_app/src/styles/react-app.css`

## 2. Existing Design System

The repo already has the beginning of a real design system.

- `tokens.css` defines fonts, colors, shadows, and a few radius aliases.
- `react-app.css` maps those tokens into the Tailwind theme.
- `publicStyles.ts` defines reusable public helpers:
  - `publicSurfaceWidth`
  - `publicPageSection`
  - `publicSectionShell`
  - `publicCardShell`
  - `publicHeadingClass`
  - `publicBodyClass`
- `Button.tsx` and `Badge.tsx` already standardize part of the control system.

The main issue is not "no system exists." The issue is:

- the system is too shallow
- the system is not enforced
- page files still make many one-off layout decisions inline

## 3. Evidence Snapshot

Repo-wide drift signals found during the scout:

- Unique `max-w-[...]` values currently in use:
  - `max-w-[1480px]`
  - `max-w-[1320px]`
  - `max-w-[1220px]`
  - `max-w-[720px]`
  - `max-w-[52rem]`
  - `max-w-[36rem]`
  - `max-w-[35rem]`
  - `max-w-[34rem]`
  - `max-w-[26rem]`
  - `max-w-[22rem]`
  - `max-w-[11ch]`
  - `max-w-[10ch]`
- Radius usage count:
  - `rounded-[1.75rem]` x34
  - `rounded-[1.25rem]` x17
  - `rounded-[1.5rem]` x11
  - `rounded-[1.3rem]` x5
  - `rounded-[1rem]` x5
  - `rounded-[1.35rem]` x4
  - `rounded-[2rem]` x4
  - `rounded-[1.4rem]` x3
  - `rounded-[1.2rem]` x1
  - `rounded-[1.1rem]` x1
- Common spacing classes:
  - `gap-3` x72
  - `px-4` x58
  - `gap-4` x51
  - `gap-2` x45
  - `p-6` x33
  - `p-5` x32
  - `p-4` x24
  - `px-8` x12
  - `p-7` x3
- Common shell bundle:
  - the core `rounded-[1.75rem] border-[1.5px] border-charcoal/75 ...` pattern appears at least 28 times inline
- Primitive usage:
  - `Card.tsx` exists
  - `PageSection.tsx` exists
  - no JSX usage of `<Card>` or `<PageSection>` was found in `react_app/src` during this scout

Conclusion: the repo has shared visual language, but not shared layout enforcement.

## 4. Key Findings

### 4.1 Container Drift

Different surfaces use different max widths:

- public layout: `max-w-[1480px]`
- workspace layout: `max-w-[1220px]`
- editor layout: `max-w-[1320px]`

This is not automatically wrong, but in the current repo it causes three problems:

- the public surface feels extra wide relative to the content density
- header, hero, rails, and cards do not feel optically tied to one grid
- shared components move between surfaces without a consistent outer rhythm

### 4.2 Section Rhythm Is Split Across Too Many Layers

Public rhythm is currently composed in multiple places:

- `PublicLayout.tsx` adds page-level `px-*` and `py-*`
- `publicPageSection` adds another vertical rhythm layer
- individual sections add their own `mb-*`, `mt-*`, and custom gap rules

That means spacing is not owned by one source of truth. A large refactor becomes risky because changing one layer does not predictably fix the final spacing.

### 4.3 PublicSection Is Semantic, Not Structural

`react_app/src/components/public/PublicSection.tsx` only wraps a `section`.

It does not:

- enforce a container
- enforce horizontal gutters
- enforce internal spacing
- define a default content width

So every page section still decides its own structure and alignment.

### 4.4 Shared Shells Exist, But Most Surfaces Rebuild Them Inline

The same shell is rebuilt in many places instead of going through a single primitive:

- dashboard cards
- resume library intro
- JD panels
- editor breadcrumb/status shells
- modal bodies
- public cards

This is the main reason a "fix spacing everywhere" prompt tends to thrash across 15-30 files.

### 4.5 Button and Pill Styles Are Only Partially Standardized

`Button.tsx` helps, but many pill-style actions are still hand-rolled:

- pagination buttons
- editor mode tabs
- workspace nav pills
- JD actions
- resume card actions

The result is:

- similar controls with different heights
- similar controls with different paddings
- similar controls with different border treatments

### 4.6 Radius Scale Is Too Wide

You already have a dominant card radius at `1.75rem`, which is good. But the repo then introduces:

- `1rem`
- `1.1rem`
- `1.2rem`
- `1.25rem`
- `1.3rem`
- `1.35rem`
- `1.4rem`
- `1.5rem`
- `1.75rem`
- `2rem`

This is a classic "AI drift" smell. The UI still feels related, but not tight.

### 4.7 Public Home Page Is The Most Visible Alignment Problem

The screenshots line up with what the code shows in `HomePage.tsx`.

Hero issues:

- the hero media block uses a wide `max-w-[52rem]`
- the hero grid ratio favors the image heavily
- the image card has extra framing, shadow, and rotation
- decorative layers add more visual mass on the right side

Net effect:

- the hero image feels larger than the text system can balance
- the two columns do not feel anchored to the same underlying grid

Story rail issues:

- story cards use `w-[18rem]`, `sm:w-[19rem]`, `lg:w-[20rem]`
- the index label sits between image and title
- titles vary in line count without a stronger internal card layout

Net effect:

- the cards read as separate experiments rather than one rail system
- the title area feels detached from the image block

Feature section issues:

- the heading block is centered, then the 3 cards switch back to a separate grid rhythm
- feature cards use `md:min-h-[17rem]`
- icon blocks, titles, and body copy are top-aligned with lots of leftover white space

Net effect:

- the cards look padded, but not balanced
- badges and icon blocks feel like floating stickers instead of layout anchors

Header issues:

- `PublicHeader.tsx` uses a 3-column layout across a very wide public surface
- brand, centered nav, and auth CTA are technically aligned but not optically grouped

Net effect:

- the top row feels stretched
- the brand and CTA look detached from the nav

### 4.8 About Page Is Cleaner Than Home, But Still Uses Local Overrides

`AboutPage.tsx` is structurally calmer than `HomePage.tsx`, but it still introduces:

- local max widths
- local min heights
- more custom radii
- more local panel padding choices

This means the About page is closer to the target, but not fully normalized.

### 4.9 Workspace and Editor Surfaces Share a Style Language by Copy-Paste

The workspace pages do feel visually related, but mostly because they repeat the same shell bundle manually.

Examples:

- `DashboardPage.tsx`
- `ResumesPage.tsx`
- `JdsPage.tsx`
- `EditorPage.tsx`
- `ResumeCard.tsx`
- `JdResultPane.tsx`
- `AtsFullReport.tsx`

This is workable for a prototype, but it makes repo-wide cleanup expensive because changes do not cascade.

### 4.10 Modals Are Almost The Same Component Three Times

`AuthModalHost.tsx`, `ResumeModalHost.tsx`, and `JdModalHost.tsx` all rebuild nearly the same modal shell.

They share:

- the same overlay treatment
- the same dialog width pattern
- the same close button structure
- the same tactile border/shadow language

This is a very good refactor target because one shared modal shell would remove repeated spacing drift immediately.

## 5. Highest-Value Files To Tackle First

If the next phase is a real refactor, start here:

- `react_app/src/components/public/publicStyles.ts`
- `react_app/src/layouts/PublicLayout.tsx`
- `react_app/src/components/public/PublicHeader.tsx`
- `react_app/src/pages/public/HomePage.tsx`
- `react_app/src/pages/public/AboutPage.tsx`
- `react_app/src/components/ui/Button.tsx`
- `react_app/src/components/ui/Badge.tsx`
- `react_app/src/components/ui/Card.tsx`
- `react_app/src/components/ui/PageSection.tsx`
- `react_app/src/layouts/WorkspaceLayout.tsx`
- `react_app/src/layouts/EditorLayout.tsx`
- `react_app/src/pages/workspace/DashboardPage.tsx`
- `react_app/src/pages/workspace/ResumesPage.tsx`
- `react_app/src/pages/workspace/JdsPage.tsx`
- `react_app/src/pages/workspace/EditorPage.tsx`
- `react_app/src/components/workspace/ResumeCard.tsx`
- `react_app/src/modals/AuthModalHost.tsx`
- `react_app/src/modals/ResumeModalHost.tsx`
- `react_app/src/modals/JdModalHost.tsx`

## 6. Recommended Normalization Rules

These are the system decisions I would lock before letting an AI editor refactor 15-30 files.

### 6.1 Width Rules

- Pick one public surface width.
- Pick one app surface width.
- Keep the same gutter scale across both.

Suggested starting point:

- public: `max-w-[1280px]` to `max-w-[1360px]`
- app/editor: `max-w-[1200px]` to `max-w-[1280px]`
- gutters: `px-4 sm:px-6 lg:px-8`

### 6.2 Section Rhythm Rules

- let layouts own major page gutters
- let section wrappers own section spacing
- avoid ad hoc `mt-*` and `mb-*` for section-level rhythm unless there is a clear editorial reason

### 6.3 Radius Rules

Collapse radii down to a small set:

- small inset surfaces: `1rem`
- inner panels/media frames: `1.25rem`
- major cards/shells: `1.75rem`
- pills only: `9999px`

### 6.4 Padding Rules

Collapse card padding down to a few choices:

- compact: `p-4`
- standard: `p-5 md:p-6`
- roomy public feature/media card: `p-6 md:p-7`

Avoid mixing `p-4`, `p-5`, `p-6`, and `p-7` within the same component family unless the component hierarchy makes that intentional.

### 6.5 Control Rules

Standardize:

- nav pills
- segmented tabs
- small action pills
- pagination buttons
- destructive action pills

Prefer adding variants to `Button.tsx` instead of rebuilding them in page files.

### 6.6 Shell Rules

Create a small shell vocabulary and reuse it everywhere:

- page section shell
- card shell
- inset panel shell
- modal shell
- rail card shell

Right now the repo has the look, but not the vocabulary.

## 7. Refactor Order

Do not ask the AI editor to clean the whole UI in one pass. Use this order.

### Phase 1: Normalize The System

Ask it to:

- consolidate public and app surface widths
- tighten radius scale
- expand shared shells
- expand `Button` variants
- decide whether `Card` and `PageSection` should become the actual standard primitives

### Phase 2: Fix Public Surfaces

Ask it to:

- normalize header alignment
- rebalance the home hero grid
- standardize story rail cards
- standardize feature cards
- align About page sections to the same public rhythm

### Phase 3: Fix Workspace and Editor Surfaces

Ask it to:

- replace repeated shell bundles with shared primitives
- standardize page intros
- standardize action pills and pagination controls
- align workspace and editor outer widths

### Phase 4: Fix Modals

Ask it to:

- create one shared modal shell
- move close button, overlay, and body spacing into that shared shell
- apply it to auth, resume, and JD modals

## 8. Ready-To-Use AI Editor Prompts

### Prompt 1: Turn This Audit Into A Refactor Plan

```text
Use ui-audit.md as the source of truth.

Create a refactor plan for the frontend UI with these sections:
- shared design decisions
- files to change first
- low-risk changes
- risky changes
- verification checklist

Do not edit code yet.
```

### Prompt 2: Normalize Shared Layout And Shell Primitives

```text
Refactor the shared UI system first.

Goals:
- unify public and app container rules
- standardize section rhythm
- standardize radius scale
- standardize card/modal shell styles
- expand Button variants for nav pills, small action pills, and destructive pills

Constraints:
- preserve the current visual language
- avoid changing business logic
- reduce inline class duplication
- prefer shared primitives over repeated class bundles

Files to target first:
- react_app/src/components/public/publicStyles.ts
- react_app/src/layouts/PublicLayout.tsx
- react_app/src/layouts/WorkspaceLayout.tsx
- react_app/src/layouts/EditorLayout.tsx
- react_app/src/components/ui/Button.tsx
- react_app/src/components/ui/Badge.tsx
- react_app/src/components/ui/Card.tsx
- react_app/src/components/ui/PageSection.tsx
```

### Prompt 3: Normalize Public Pages

```text
Refactor the public pages to align to the shared system from ui-audit.md.

Goals:
- tighten header alignment
- rebalance the home hero
- standardize rail card spacing and widths
- standardize feature card spacing
- align section vertical rhythm across Home and About

Constraints:
- keep the same playful brand direction
- reduce one-off max-width, min-height, and radius values
- remove layout decisions that should belong to shared primitives

Files:
- react_app/src/components/public/PublicHeader.tsx
- react_app/src/pages/public/HomePage.tsx
- react_app/src/pages/public/AboutPage.tsx
```

### Prompt 4: Normalize Workspace, Editor, And Modals

```text
Refactor workspace, editor, and modal surfaces using the shared shell system from ui-audit.md.

Goals:
- replace repeated card shell class bundles
- standardize intro sections and action controls
- standardize modal shell spacing
- reduce duplicate pill button styles

Files:
- react_app/src/pages/workspace/DashboardPage.tsx
- react_app/src/pages/workspace/ResumesPage.tsx
- react_app/src/pages/workspace/JdsPage.tsx
- react_app/src/pages/workspace/EditorPage.tsx
- react_app/src/components/workspace/ResumeCard.tsx
- react_app/src/modals/AuthModalHost.tsx
- react_app/src/modals/ResumeModalHost.tsx
- react_app/src/modals/JdModalHost.tsx
```

## 9. Manual QA Checklist

Use this after each chunk, not only at the very end.

- header brand, nav, and CTA feel like one row on desktop
- the left edge of major content blocks lines up across sections
- hero text and hero media feel balanced at desktop widths
- section spacing feels consistent from one block to the next
- cards in the same row share padding and visual weight
- pills and action buttons of the same role share height and padding
- modals share the same outer shell and internal rhythm
- no horizontal overflow appears on desktop or mobile
- mobile top bars and tab pills share a consistent control height
- public pages still feel playful, not flattened into generic SaaS cards

## 10. Bottom Line

This repo does not have a "CSS bug." It has a system enforcement problem.

The good news is:

- the visual language already exists
- the tokens already exist
- the main issue is normalization, not reinvention

That means the next best move is:

1. lock a few shared layout rules
2. refactor shared primitives
3. refactor public pages
4. refactor workspace/editor/modals

That sequence is much safer than asking an editor to "fix spacing everywhere" in one pass.
