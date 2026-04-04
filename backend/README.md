# FastAPI Backend

The active backend is now the Python/FastAPI app rooted in [main.py](./main.py).

## Local Run

1. Install Python dependencies:

```powershell
python -m pip install --user -r backend/requirements.txt
```

2. Make sure `.env.local` contains a working `DATABASE_URL`.

3. Run migrations and demo seed:

```powershell
python -m backend.run_migrations
python -m backend.seed_demo_data
```

4. Start the API:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 4000
```

## TeX Template Rendering

FastAPI owns the API, but `/api/resumes/:id/export/tex` is bridged to the real TypeScript template renderers in [`../Tex Templates`](../Tex%20Templates).

- bridge entry: [tex_bridge/render_resume.ts](./tex_bridge/render_resume.ts)
- Python wrapper: [templates.py](./templates.py)

This means the `Tex Templates` folder remains the TeX source of truth even after the backend moved to FastAPI.

The bridge currently uses the local `tsx` runtime from `backend/node_modules`, so keep the backend Node dependencies installed if you want real template-specific `.tex` output.
