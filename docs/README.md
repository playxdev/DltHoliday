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
| Icons | Lucide React |
| Import/Export | SheetJS (xlsx) |

## Quick Start

```bash
cd WEBAPP
cp .env.example .env.local   # edit DB credentials
npm install
npm run dev                   # http://localhost:3000
```

## Project Structure

```
WEBAPP/
├── docs/                     # Documentation & examples
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (Google Sans, ThemeProvider, AppShell)
│   │   ├── page.tsx          # / → redirect to /dashboard
│   │   ├── globals.css       # CSS variables, component classes, animations
│   │   ├── loading.tsx       # Spinner page loader
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Stat cards + recent holidays
│   │   ├── holidays/
│   │   │   ├── page.tsx      # CRUD list, search, pagination, import
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Edit single holiday
│   │   └── api/
│   │       ├── health/       # GET  — DB connectivity check
│   │       ├── dashboard/    # GET  — aggregate stats
│   │       └── holidays/
│   │           ├── route.ts       # GET (paginated), POST (create)
│   │           ├── [id]/route.ts  # GET, PUT, DELETE
│   │           └── import/route.ts # POST multipart (CSV/XLSX)
│   ├── components/
│   │   ├── app-shell.tsx      # Sidebar + Header + Main + Footer layout
│   │   ├── sidebar.tsx        # Collapsible nav (w-16 ↔ w-64)
│   │   ├── header.tsx         # Top bar: hamburger, title, theme toggle
│   │   ├── footer.tsx         # Copyright, version, health check
│   │   ├── theme-provider.tsx # next-themes wrapper
│   │   ├── theme-toggle.tsx   # Sun/Moon with View Transitions ripple
│   │   ├── stat-card.tsx      # Dashboard metric card
│   │   ├── holiday-table.tsx  # Data table rows
│   │   ├── holiday-form.tsx   # Create/edit form
│   │   ├── delete-dialog.tsx  # Confirm deactivation modal
│   │   ├── import-dialog.tsx  # CSV/XLSX import with drag & drop
│   │   └── toast.tsx          # Top-center notifications
│   ├── lib/
│   │   ├── db.ts              # mssql connection pool + query helpers
│   │   └── db-config.ts       # Env var parser (SQLSERVER_DSN or DB_SERVER/*)
│   └── types/
│       └── index.ts           # Holiday, ApiResponse, PaginatedResponse, etc.
├── .env.example               # Template with both DSN and individual params
├── tailwind.config.ts         # data-theme dark mode + Google Sans font
└── next.config.ts             # Standalone output + mssql external package
```

## Database Configuration

The app reads credentials in priority order:

1. `DB_SERVER` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` (individual params)
2. `SQLSERVER_DSN` (Go-style DSN string)

See `.env.example` for the full format.

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
