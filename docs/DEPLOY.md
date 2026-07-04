# Deployment Guide

## Prerequisites

- Node.js 18+
- SQL Server instance accessible from the deployment target
- Environment variables configured (see `.env.example`)

---

## Option A: Vercel (Recommended)

Vercel natively supports Next.js with Node.js runtime, which is required for the `mssql` package.

### Why Vercel, not Cloudflare Pages

The `mssql` driver opens raw TCP sockets (TDS protocol) to connect to SQL Server. Cloudflare Workers/Pages use a sandboxed V8 isolate that only supports HTTP `fetch()` — it cannot open TCP connections or use native Node.js modules. Deploying API routes to Cloudflare Pages fails because:

- All API routes use `export const runtime = "nodejs"` (required by `mssql`)
- Cloudflare only supports `runtime: "edge"` (no TCP, no native modules)
- Even if ported to edge runtime, `mssql` cannot function in Workers

Vercel supports both Edge and Node.js runtimes natively. This project is configured for Node.js runtime and works out of the box.

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
cd WEBAPP
npx vercel
```

Vercel auto-detects Next.js and configures the build settings.

### 3. Set Environment Variables

In the Vercel dashboard (Project → Settings → Environment Variables) or via CLI:

```bash
# Database (SQL Server must be publicly reachable)
vercel env add SQLSERVER_DSN production
# or individual params:
vercel env add DB_SERVER production
vercel env add DB_PORT production
vercel env add DB_NAME production
vercel env add DB_USER production
vercel env add DB_PASSWORD production

# Authentication
vercel env add AUTH_USERNAME production
vercel env add AUTH_PASSWORD production
vercel env add AUTH_SECRET_TOKEN production
vercel env add JWT_SIGNING_KEY production
```

### 4. Redeploy

```bash
npx vercel --prod
```

### 5. Verify

```bash
curl https://your-app.vercel.app/api/health
# {"status":"ok","database":{"connected":true,"server":"...","database":"DLT"}}
```

---

## Option B: Docker (Self-hosted)

### Build & Run

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
| `SQLSERVER_DSN` | * | Go-style DSN: `sqlserver://user:pass@host:1433?database=DLT&encrypt=disable` |
| `DB_SERVER` | * | SQL Server hostname or IP |
| `DB_PORT` | | Default `1433` |
| `DB_NAME` | | Default `DLT` |
| `DB_USER` | | Database username |
| `DB_PASSWORD` | | Database password |
| `AUTH_USERNAME` | ✓ | Login username |
| `AUTH_PASSWORD` | ✓ | Login password |
| `AUTH_SECRET_TOKEN` | ✓ | Security token (3rd factor) |
| `JWT_SIGNING_KEY` | ✓ | JWT signing secret |

\* Either `SQLSERVER_DSN` OR the individual `DB_*` params must be set.

---

## Health Check

After deployment, verify the API is reachable:

```bash
curl https://your-app.com/api/health
# {"status":"ok","timestamp":"...","database":{"connected":true,"server":"...","database":"DLT"}}
```
