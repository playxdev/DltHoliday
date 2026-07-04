# DLT Holiday Admin

Central Admin Web Application for managing holidays in the DLT system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Theme | `data-theme` attribute + CSS custom properties |
| Database | SQL Server via `mssql` |
| Auth | JWT (jose) + httpOnly cookie |
| Icons | Lucide React |
| Import/Export | SheetJS (xlsx) |
| Deployment | Vercel (Node.js runtime) |

## Quick Start

```bash
cp .env.example .env.local   # edit credentials
npm install
npm run dev                   # http://localhost:3000
```

## Authentication

Login requires three fields: **username** + **password** + **security token**.

Authentication uses httpOnly JWT cookies. After login, all API calls include the cookie automatically (same-origin).

## Environment Variables

```bash
# Database
SQLSERVER_DSN="sqlserver://user:pass@host:1433?database=DLT&encrypt=disable"

# Auth
AUTH_USERNAME="admin"
AUTH_PASSWORD="your_admin_password"
AUTH_SECRET_TOKEN="your_security_token"
JWT_SIGNING_KEY="your_jwt_signing_key"
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout (Google Sans, LayoutWrapper)
│   ├── page.tsx             # / → redirect to /dashboard
│   ├── globals.css          # CSS variables, component classes, animations
│   ├── login/
│   │   └── page.tsx         # Auth: username + password + token
│   ├── dashboard/
│   │   └── page.tsx         # Stat cards + activity log
│   ├── holidays/
│   │   ├── page.tsx         # CRUD list, search, pagination, import/export
│   │   └── [id]/
│   │       └── page.tsx     # Edit single holiday
│   └── api/
│       ├── auth/
│       │   ├── login/       # POST — validate credentials, issue JWT
│       │   ├── logout/      # POST — clear session
│       │   └── me/          # GET  — current session
│       ├── health/          # GET  — DB connectivity check
│       ├── dashboard/       # GET  — aggregate stats
│       └── holidays/
│           ├── route.ts          # GET (paginated), POST (create)
│           ├── [id]/route.ts     # GET, PUT, DELETE
│           ├── export/route.ts   # GET — CSV/XLSX download
│           └── import/route.ts   # POST — CSV/XLSX upload
├── middleware.ts            # Route protection (JWT verify)
├── components/
│   ├── app-shell.tsx        # Sidebar + Header + Main + Footer
│   ├── sidebar.tsx          # Collapsible nav + logout
│   ├── header.tsx           # Top bar: hamburger, title, theme toggle
│   ├── footer.tsx           # Copyright, version, health check
│   ├── layout-wrapper.tsx   # Handles login vs app layout
│   ├── theme-provider.tsx   # next-themes wrapper
│   ├── theme-toggle.tsx     # Sun/Moon with View Transitions
│   ├── stat-card.tsx        # Dashboard metric card
│   ├── holiday-table.tsx    # Data table rows
│   ├── holiday-form.tsx     # Create/edit form
│   ├── delete-dialog.tsx    # Confirm deactivation modal
│   ├── import-dialog.tsx    # CSV/XLSX import with drag & drop
│   └── toast.tsx            # Notification system
├── lib/
│   ├── auth.ts              # JWT sign/verify, credential validation
│   ├── db.ts                # mssql connection pool + query helpers
│   └── db-config.ts         # Env var parser
└── types/
    └── index.ts             # Holiday, ApiResponse, PaginatedResponse, etc.
```

## Database Configuration

The app reads credentials in priority order:

1. `DB_SERVER` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` (individual params)
2. `SQLSERVER_DSN` (Go-style DSN string)

## Deployment

### Why Vercel (not Cloudflare Pages)

This project uses the `mssql` package to connect to Microsoft SQL Server. The `mssql` driver opens raw TCP sockets (TDS protocol) to the database — this requires a full Node.js runtime.

Cloudflare Workers / Pages use V8 isolates with a sandboxed fetch-only network layer. They **cannot** open TCP connections or use native Node.js modules like `mssql`. Attempting to deploy API routes to Cloudflare Pages fails with:

> `The following routes were not configured to run with the Edge Runtime`

Even switching to `runtime: "edge"` does not help — the `mssql` driver simply cannot function in Workers.

**Vercel** natively supports Next.js with the Node.js runtime (`runtime: "nodejs"`), which is required for the database connection. All API routes are already configured with `export const runtime = "nodejs"` and work out of the box.

### Deploy to Vercel

**1. Install Vercel CLI**

```bash
npm i -g vercel
```

**2. Deploy**

```bash
cd WEBAPP
npx vercel
```

Follow the prompts. Vercel auto-detects Next.js and configures the build.

**3. Set Environment Variables**

In the Vercel dashboard (https://vercel.com/ → your project → Settings → Environment Variables):

| Name | Value | Environment |
|------|-------|-------------|
| `SQLSERVER_DSN` | `sqlserver://user:pass@host:1433?database=DLT&encrypt=disable` | Production |
| `AUTH_USERNAME` | `admin` | Production |
| `AUTH_PASSWORD` | `your_password` | Production |
| `AUTH_SECRET_TOKEN` | `your_token` | Production |
| `JWT_SIGNING_KEY` | `your_signing_key` | Production |

> **Important:** Your SQL Server must be publicly accessible from Vercel's build servers (AWS us-east-1). If behind a firewall, whitelist Vercel's IP ranges or use a tunnel.

**4. Redeploy**

```bash
npx vercel --prod
```

**5. Verify**

```bash
curl https://your-app.vercel.app/api/health
# {"status":"ok","database":{"connected":true,...}}
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for additional deployment options (Docker, self-hosted).

## Design System

Follows the [AAAADMIN Design System](docs/STYLE.md):

- Dark/light via `data-theme` attribute + CSS custom properties
- Global transitions (`background-color`, `color`, `border-color`, `box-shadow`)
- Component classes: `.btn .btn-primary`, `.badge .badge-success`, `.data-table`, `.form-input`, `.nav-link`, `.modal-overlay`
- Collapsible sidebar persisted in `localStorage` (`aaa_sidebar_collapsed`)
- Theme preference persisted in `localStorage` (`aaa_theme`)

## Import Holidays

Supports CSV and Excel (.xls/.xlsx). See [docs/IMPORT.md](docs/IMPORT.md) for format details and an example file.

## Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run linter
```
