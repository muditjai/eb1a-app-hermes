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

The backend uses in-memory storage by default. Set `MONGODB_URI` to persist
feedback submissions, users, and petition purchases in MongoDB. If
`MONGODB_DB_NAME` is omitted, the backend uses `eb1a_app_v2_dev` by default
and `eb1a_app_v2_prod` when `NODE_ENV=production`. Feedback is stored in the
`feedback_submissions` collection.

The frontend shows the placeholder landing page at `/` by default. Set
`VITE_ENABLE_PDF_LANDING=true` in `frontend/.env` to iterate on the searchable
PDF gallery landing page instead.

## Deployment

Backend:

```bash
docker build -f backend/Dockerfile -t eb1a-fyi-api .
```

Production backend environment:

- `PORT=8080`
- `NODE_ENV=production`
- `MONGODB_URI` for the Atlas user scoped to `eb1a_app_v2_prod`
- `MONGODB_DB_NAME=eb1a_app_v2_prod`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`

The Atlas production database is `eb1a_app_v2_prod`. It contains
`feedback_submissions`, `users`, and `purchases`; the backend also ensures the
required indexes on startup.

Frontend to GCS:

```bash
export VITE_API_BASE_URL=https://eb1a-app-hermes-api-qy4ypwumaq-uc.a.run.app
export GCS_BUCKET=your-eb1a-fyi-static-bucket
bash frontend/deploy-gcs.sh
```
