# Deployment Guide

## Prerequisites

- Node.js 20+
- SQL Server instance accessible from the deployment target
- Environment variables configured (see `.env.example`)

---

## Option A: Node.js Server (Full App)

Deploy the complete application (frontend + API) to any Node.js hosting.

### 1. Build

```bash
npm install
npm run build
```

### 2. Start

```bash
npm run start
```

The app runs on `http://localhost:3000` — auth uses httpOnly cookies (same-origin).

### 3. Environment Variables

```bash
SQLSERVER_DSN="sqlserver://user:pass@host:1433?database=DLT&encrypt=disable"
AUTH_USERNAME="admin"
AUTH_PASSWORD="your_admin_password"
AUTH_SECRET_TOKEN="your_security_token"
JWT_SIGNING_KEY="your_jwt_signing_key"
```

---

## Option B: Cloudflare Pages (Frontend) + Node.js Server (API)

The API (`/api/*`) runs on a Node.js server while Cloudflare Pages serves the frontend.

### 1. Deploy API to Node.js Server

Build and run the full app on Fly.io, Railway, or any VPS:

```bash
npm install
npm run build
npm run start
```

Make note of the API server URL (e.g. `https://api.yourdomain.com`).

### 2. Deploy Frontend to Cloudflare Pages

Set `NEXT_PUBLIC_API_URL` to your API server URL in `.env.local`:

```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

Then build and deploy:

```bash
npm run deploy
```

Or deploy via Cloudflare Dashboard:
1. Connect GitHub repo
2. Framework preset: Next.js
3. Build command: `npm run deploy` (or use `opennextjs-cloudflare build && opennextjs-cloudflare deploy`)
4. Set `NEXT_PUBLIC_API_URL` in Cloudflare Pages environment variables

### 3. How It Works

- Cloudflare Pages serves the frontend (pages, components, styles)
- Frontend calls the Node.js API server using Bearer token auth
- Auth tokens are stored in `localStorage` and sent via `Authorization: Bearer <token>` header
- The API server validates Bearer tokens AND httpOnly cookies

---

## Option C: Docker

```bash
npm run build
```

Create `Dockerfile`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY .next ./.next
COPY public ./public
COPY node_modules/.prisma ./node_modules/.prisma 2>/dev/null || true
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node_modules/.bin/next", "start"]
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
| `AUTH_USERNAME` | ** | Admin username |
| `AUTH_PASSWORD` | ** | Admin password |
| `AUTH_SECRET_TOKEN` | ** | Security token |
| `JWT_SIGNING_KEY` | ** | JWT signing key |
| `NEXT_PUBLIC_API_URL` | | API server URL (for Cloudflare Pages, empty = same-origin) |

\* Either `SQLSERVER_DSN` OR the individual `DB_*` params must be set.
\** Required for auth. All three credentials must match to log in.

---

## Health Check

```bash
curl https://your-app.com/api/health
# {"status":"ok","database":{"connected":true,"server":"...","database":"DLT"}}
```
