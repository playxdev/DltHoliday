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
| Auth | JWT (jose) + httpOnly cookie + Bearer token |
| Icons | Lucide React |
| Import/Export | SheetJS (xlsx) |
| Deployment | Node.js, Docker, Cloudflare Pages (OpenNext) |

## Quick Start

```bash
cp .env.example .env.local   # edit credentials
npm install
npm run dev                   # http://localhost:3000
```

## Authentication

Login requires three fields: **username** + **password** + **security token**.

After successful login, auth supports two modes:
- **Same-origin**: httpOnly JWT cookie (standard Next.js deployment)
- **Cross-origin**: Bearer token in `Authorization` header (Cloudflare Pages → separate API server)

## Environment Variables

```bash
# Database
SQLSERVER_DSN="sqlserver://user:pass@host:1433?database=DLT&encrypt=disable"
# OR individual params
DB_SERVER="host"
DB_PORT="1433"
DB_NAME="DLT"
DB_USER="sa"
DB_PASSWORD="your_db_password"

# Auth
AUTH_USERNAME="admin"
AUTH_PASSWORD="your_admin_password"
AUTH_SECRET_TOKEN="your_security_token"
JWT_SIGNING_KEY="your_jwt_signing_key"

# API URL (for Cloudflare Pages, empty = same-origin)
NEXT_PUBLIC_API_URL=""
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout (Google Sans, LayoutWrapper)
│   ├── page.tsx             # / → redirect to /dashboard
│   ├── globals.css          # CSS variables, component classes, animations
│   ├── loading.tsx          # Spinner page loader
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
│   ├── auth-store.ts        # Client-side auth state (localStorage)
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

See [docs/DEPLOY.md](docs/DEPLOY.md) for:
- Node.js server (full app)
- Cloudflare Pages (frontend) + Node.js server (API)
- Docker

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
npm run preview  # Cloudflare Pages local preview
npm run deploy   # Cloudflare Pages deploy
```
