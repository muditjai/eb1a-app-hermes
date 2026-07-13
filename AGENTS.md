# AGENTS.md — eb1a.fyi project spec

## Product goal

Build **eb1a.fyi**, a consumer-friendly website where people can upload, redact, search, preview, and purchase access to redacted EB1A petitions.

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn-style local UI components.
- Backend: Express.js, TypeScript, Zod validation, Stripe checkout integration.
- Tests: Vitest for backend and frontend; Supertest for API endpoints; Testing Library for React components.
- Deployment: backend Docker image for GCP Cloud Run or GKE; frontend static bundle for Google Cloud Storage hosting.

## Required user flows

### Creator/uploader flow

1. Creator opens `/upload` or clicks **Share a petition**.
2. Creator enters petition metadata:
   - title
   - job profile
   - company
   - location
   - criteria names, comma-separated
   - PDF file
3. Creator uploads the petition via `POST /api/petitions/upload`.
4. Creator uses the redaction workspace to place PII boxes over sensitive fields.
5. Frontend saves redaction boxes via `POST /api/petitions/:id/redactions`.
6. Creator publishes via `POST /api/petitions/:id/publish`.

Security note for future agents: the current UI records redaction rectangles and displays them as black boxes. Production must burn redactions into the PDF server-side before any full document is served; do not serve raw unredacted uploads publicly.

### Viewer/search flow

1. Home page shows a large visual petition gallery, similar to an Instagram feed of PDF cards.
2. Search bar filters by job profile, company, location, criteria names, and summary text.
3. Each PDF card must visually blur the bottom 70% using `data-testid="pdf-preview-blur"` and `backdrop-blur-md`.
4. Anonymous users can view up to 1 page.
5. After page 1, anonymous users see a login prompt.
6. Logged-in unpaid users can view 2 additional pages, for 3 total.
7. After page 3, logged-in unpaid users see a Stripe paywall.
8. Paid users can view the full petition.

## Backend API contract

Every endpoint must have tests and sample request/response docs in `docs/api.md`.

- `GET /api/health`
- `GET /api/petitions`
- `GET /api/petitions/:id`
- `GET /api/petitions/:id/access`
- `GET /api/petitions/:id/pdf`
- `POST /api/petitions/upload`
- `POST /api/petitions/:id/redactions`
- `POST /api/petitions/:id/publish`
- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/payments/create-checkout-session`
- `POST /api/payments/webhook`

## Code quality rules for agents

- Keep all source code in TypeScript.
- Keep files modular; never exceed 1,000 lines in any source file.
- Add or update a test for every behavior change.
- Run `npm test` before handing work back.
- Run `npm run build` before deployment changes.
- Do not invent fake verification output. Report real command output.
- Keep UI simple, attractive, and consumer-friendly.
- Prefer small pure functions in `backend/src/domain` for policy logic.
- Keep API request/response docs updated whenever endpoints change.

## Local commands

```bash
npm install
npm test
npm run build
npm run dev --workspace=@eb1a-fyi/backend
npm run dev --workspace=@eb1a-fyi/frontend
```

## Deployment

### Backend on GCP

Build the backend Docker image from `backend/Dockerfile` and deploy to Cloud Run with `PORT=8080`.

Required production environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- persistent storage/database variables when replacing the in-memory prototype repository

### Frontend on GCS

Use `frontend/deploy-gcs.sh`.

```bash
export GCS_BUCKET=eb1a-app-v2-frontend
bash frontend/deploy-gcs.sh
```

Set `VITE_API_BASE_URL` to the deployed backend origin when building.
