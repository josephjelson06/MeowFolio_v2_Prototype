# Goal Description

Analyze the MeowFolio_v2_Prototype repository, fix the duplicated folder structure, and run end-to-end testing of the primary workflows. This will satisfy the requirements to organize the `frontend/` vs `api/` boundary, fix dependency issues, and validate the application architecture defined in `PLAN.md`.

## User Review Required

> [!IMPORTANT]
> The backend server logic appears to be defined as Vercel serverless functions in the `api/` directory. Are you currently intending to run the application using `vercel dev` locally, or should the frontend purely rely on the mocked services for the end-to-end tests? (The `PLAN.md` suggests using mocked data for now.)

## Proposed Changes

We will restructure the project to work as an elegant Monorepo using `npm workspaces`.

### Root Workspace

- Configure npm workspaces in root `package.json`.
- Add global `dev`, `build`, and `install` scripts at the root so that `npm run dev` forwards the command correctly to `frontend/`.
- Clean up duplicate `node_modules` folders.

#### [MODIFY] package.json
We will add `"workspaces": ["frontend"]` and `"scripts": {"dev": "npm run dev --workspace=frontend", ...}`.

### Filesystem Cleanup

- We will delete `c:\Users\josep\Desktop\Resume_Project\Prototype_v2\node_modules` and `frontend\node_modules`.
- We will delete `package-lock.json` in both places.
- Next, we will run a clean `npm install` gracefully handling all dependencies in the new workspace structure.

## Open Questions

> [!WARNING]
> Do you want the end-to-end tests to strictly mock the backend calls (as `PLAN.md` suggests), or should we mock a simple express server to serve the functions in `api/` for the test run? 

## Verification Plan

### Automated Tests
- We will initialize the TestSprite MCP integration.
- We will generate a frontend test plan focusing on the public pages, workspace shell, and application workflows.
- Once the application is running via `npm run dev`, we will execute `testsprite_generate_code_and_execute` to systematically validate the core UI paths.

### Manual Verification
- We will attempt local navigation and test imports manually to verify everything builds correctly.
