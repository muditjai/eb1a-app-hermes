#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GCS_BUCKET:-}" ]; then
  echo "Set GCS_BUCKET=your-eb1a-fyi-static-bucket" >&2
  exit 1
fi

npm ci
npm run build --workspace=@eb1a-fyi/frontend
gsutil -m rsync -r -d frontend/dist "gs://${GCS_BUCKET}"
gsutil web set -m index.html -e index.html "gs://${GCS_BUCKET}"
