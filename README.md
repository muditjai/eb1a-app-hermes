# eb1a-app-hermes

Landing page for eb1a.fyi, built with Vite, React, TypeScript, and PostHog.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_POSTHOG_KEY` in `.env.local` to enable analytics locally. The app defaults
to the US PostHog ingest host when `VITE_POSTHOG_HOST` is not set.

## Build

```bash
npm run build
```

The static site is emitted to `dist/`.

## Deploy to GCS

The production URL is `https://eb1a.fyi`.

```bash
npm run build
gsutil -m rsync -r -d dist gs://eb1a.fyi
gsutil -m setmeta -h "Cache-Control:no-cache, max-age=0" gs://eb1a.fyi/index.html
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" "gs://eb1a.fyi/assets/**"
```
