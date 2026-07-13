#!/usr/bin/env bash
set -euo pipefail

GCS_BUCKET="${GCS_BUCKET:-eb1a-app-v2-frontend}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://eb1a-app-hermes-api-qy4ypwumaq-uc.a.run.app}"
export VITE_POSTHOG_KEY="${VITE_POSTHOG_KEY:-phc_Bp5zE3zbSLgygDSv5fWi4BDvLx38xoq826R5pQptFDn8}"
export VITE_POSTHOG_HOST="${VITE_POSTHOG_HOST:-https://us.i.posthog.com}"

npm ci
npm run build --workspace=@eb1a-fyi/frontend
gsutil -m rsync -r -d frontend/dist "gs://${GCS_BUCKET}"
gsutil cp frontend/dist/index.html "gs://${GCS_BUCKET}/feedback"
gsutil cp frontend/dist/index.html "gs://${GCS_BUCKET}/feedback/index.html"
ACCESS_TOKEN="$(gcloud auth print-access-token)"
curl -fsS -X POST \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: text/html" \
  --data-binary @frontend/dist/index.html \
  "https://storage.googleapis.com/upload/storage/v1/b/${GCS_BUCKET}/o?uploadType=media&name=feedback%2F" > /dev/null
curl -fsS -X PATCH \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"cacheControl":"no-cache,max-age=0","contentType":"text/html"}' \
  "https://storage.googleapis.com/storage/v1/b/${GCS_BUCKET}/o/feedback%2F" > /dev/null
gsutil -m setmeta -h "Cache-Control:no-cache,max-age=0" \
  "gs://${GCS_BUCKET}/index.html" \
  "gs://${GCS_BUCKET}/feedback" \
  "gs://${GCS_BUCKET}/feedback/index.html"
gsutil -m setmeta -h "Cache-Control:public,max-age=31536000,immutable" "gs://${GCS_BUCKET}/assets/**" || true
gsutil web set -m index.html "gs://${GCS_BUCKET}"
