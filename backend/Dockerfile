FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace=@eb1a-fyi/backend --include-workspace-root=false

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY package.json package-lock.json ./
RUN npm run build --workspace=@eb1a-fyi/backend

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --workspace=@eb1a-fyi/backend --include-workspace-root=false && npm cache clean --force
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/assets ./backend/assets
WORKDIR /app/backend
EXPOSE 8080
CMD ["node", "dist/server.js"]
