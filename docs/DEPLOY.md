# Deployment Guide

## Prerequisites

- Node.js 18+
- SQL Server instance accessible from the deployment target
- Environment variables configured (see `.env.example`)

---

## Option A: Vercel (Recommended)

Vercel natively supports Next.js with Node.js runtime, which is required for the `mssql` package.

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
cd WEBAPP
vercel
```

### 3. Set Environment Variables

In the Vercel dashboard (or via CLI):

```bash
vercel env add SQLSERVER_DSN production
# or individual params:
vercel env add DB_SERVER production
vercel env add DB_PORT production
vercel env add DB_NAME production
vercel env add DB_USER production
vercel env add DB_PASSWORD production
```

### 4. Redeploy

```bash
vercel --prod
```

> **Note:** Vercel Edge Functions do NOT support `mssql`. Ensure API routes use the Node.js runtime (set via `export const runtime = "nodejs"` — already configured).

---

## Option B: Cloudflare Pages + Fly.io API

Since Cloudflare Workers do not support `mssql` (native TCP driver), deploy the frontend to Cloudflare Pages and the API to a Node.js platform.

### 1. Deploy API to Fly.io

```bash
cd WEBAPP
fly launch
```

Add a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY .next/standalone ./
COPY .next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
fly secrets set SQLSERVER_DSN="sqlserver://..."
fly deploy
```

### 2. Deploy Frontend to Cloudflare Pages

Build the static export:

```bash
# In next.config.ts, change:
#   output: "standalone" → output: "export"
# And add for images if using <Image>:
#   images: { unoptimized: true }

npm run build
```

The `out/` directory is ready for Cloudflare Pages. Deploy via:

1. Cloudflare Dashboard → Pages → Create Project
2. Connect your Git repo or upload `out/` directly
3. Set `NEXT_PUBLIC_API_URL` to your Fly.io API URL

> **Important:** With `output: "export"`, API routes are not included. The frontend must call the separate API server.

---

## Option C: Docker (Any Platform)

```bash
cd WEBAPP
npm run build
```

Create `Dockerfile`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY .next/standalone ./
COPY .next/static ./.next/static
EXPOSE 3000
ENV SQLSERVER_DSN="sqlserver://..."
CMD ["node", "server.js"]
```

```bash
docker build -t dlt-holiday-admin .
docker run -p 3000:3000 --env-file .env.local dlt-holiday-admin
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SQLSERVER_DSN` | * | Go-style DSN: `sqlserver://user:pass@host:1433?database=DB&encrypt=disable` |
| `DB_SERVER` | * | SQL Server hostname or IP |
| `DB_PORT` | | Default `1433` |
| `DB_NAME` | | Default `DLT` |
| `DB_USER` | | Database username |
| `DB_PASSWORD` | | Database password |
| `NEXT_PUBLIC_APP_URL` | | Application URL for self-referencing API calls |

\* Either `SQLSERVER_DSN` OR the individual `DB_*` params must be set.

---

## Health Check

After deployment, verify the API is reachable:

```bash
curl https://your-app.com/api/health
# {"status":"ok","database":{"connected":true,"server":"...","database":"DLT"}}
```
