# TODO

## Core Features

- [x] Dashboard — stat cards + recent holidays
- [x] Holidays CRUD — list, create, edit, deactivate
- [x] Search & filter — by name, by status
- [x] Pagination — server-side via OFFSET/FETCH
- [x] Data import — CSV, XLS, XLSX via drag & drop
- [x] Dark/light mode — View Transitions API ripple toggle
- [x] Collapsible sidebar — w-16 ↔ w-64 with localStorage
- [x] Health check — GET /api/health
- [x] Toast notifications — success/error/info
- [x] Responsive — mobile hamburger sidebar

## Planned

- [ ] Authentication — login page + JWT/session
- [ ] Role-based access — admin vs read-only
- [ ] Bulk delete — select multiple rows and deactivate
- [ ] Data export — download filtered results as CSV/XLSX
- [ ] Audit log — track who created/updated/deleted each holiday
- [ ] Date range filter — filter holidays between two dates
- [ ] Calendar view — monthly calendar with holiday markers
- [ ] Holiday conflict detection — warn on duplicate dates
- [ ] Keyboard shortcuts — quick nav, create, search
- [ ] Print-friendly styles — clean print layout

## Technical Debt

- [ ] Add unit tests for API routes (Vitest + MSW)
- [ ] Add integration tests for DB queries
- [ ] Improve error messages on DB connection failure
- [ ] Rate limiting on API endpoints
- [ ] Request validation middleware (Zod schemas)
- [ ] API response caching headers
- [ ] Structured logging with correlation IDs
- [ ] Graceful shutdown for DB pool
