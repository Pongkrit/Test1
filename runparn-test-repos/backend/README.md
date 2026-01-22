# node-mysql-demo

Minimal Node (Express) backend that proves RunParn DB provisioning works (MySQL/MariaDB).

## RunParn requirements satisfied
- `package.json` exists ✅
- `scripts.start` exists ✅
- binds `0.0.0.0` ✅
- uses `PORT` env var ✅
- uses RunParn DB env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`) ✅

## Endpoints
- GET `/` : small HTML page with a button to load notes
- GET `/health`
- GET `/api/notes`
- POST `/api/notes` body: `{ "title": "..." }`

On startup it auto-creates a `notes` table and inserts one row if empty.
