# eb1a.fyi

A TypeScript monorepo for **eb1a.fyi**, a consumer website for uploading, redacting, searching, previewing, and purchasing access to redacted EB1A petitions.

Read the full product and agent specification in [AGENTS.md](./AGENTS.md). API sample request/response documentation is in [docs/api.md](./docs/api.md).

## Structure

- `frontend/` — React + Vite + Tailwind + shadcn-style UI components, built as static files for GCS.
- `backend/` — Express.js + TypeScript API, packaged with Docker for GCP.
- `docs/api.md` — sample requests/responses for every endpoint.

## Quick start

```bash
npm install
npm test
npm run build
npm run generate:sample-pdf
```

The generated sample redacted PDF is written to:

- `backend/assets/sample-redacted-eb1a.pdf`
- `frontend/public/samples/sample-redacted-eb1a.pdf`

## Development

```bash
npm run dev --workspace=@eb1a-fyi/backend
npm run dev --workspace=@eb1a-fyi/frontend
```

## Deployment

Backend:

```bash
docker build -f backend/Dockerfile -t eb1a-fyi-api .
```

Frontend to GCS:

```bash
export GCS_BUCKET=your-eb1a-fyi-static-bucket
bash frontend/deploy-gcs.sh
```
