# Ponder Lab Content Architect

Internal monorepo tool for scientific audio YouTube content ideation, metadata generation, and Google Sheets logging.

## Structure

```
backend/     FastAPI + Gemini + Google Sheets
frontend/    React 18 + Vite + Tailwind
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Google Cloud service account with Sheets API access
- Gemini API key

## Google Sheets setup

1. Create a Google Cloud service account and download the JSON key.
2. Place the key at `backend/service-account.json` (or set `GOOGLE_SERVICE_ACCOUNT_FILE`).
3. Share your spreadsheet with the service account email (Editor).
4. Ensure a worksheet named **Ponder Lab Video Memory Repository** exists with header row:

   `Video Idea | Title | Description | Tags | Thumbnail`

5. Set `SPREADSHEET_ID` in `backend/.env` (from the sheet URL).

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Edit .env with GEMINI_API_KEY, SPREADSHEET_ID, etc.
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` to the backend.

## Workflow

1. **Concept** — vibe → 3 unique sound-design concepts (history-aware)
2. **Title** — pick one → 5 bracket-formatted titles
3. **Metadata** — description + 15–20 tags + thumbnail prompt
4. **Export** — edit fields → commit row to Sheets
