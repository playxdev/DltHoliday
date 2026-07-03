# STYLE — AAAADMIN Design System v1.2.0

> Copied from the AAAADMIN project. This document defines the design system used by DLT Holiday Admin.

## Overview

AAAADMIN is styled with **Tailwind CSS v3** utilities and a layer of **custom CSS classes** powered by **CSS custom properties**.

```
Tech:   Next.js 15 + TypeScript + Tailwind CSS v3 + CSS Variables
Font:   Google Sans (Thai + Latin), loaded from fonts.googleapis.com
Theme:  data-theme="light|dark" on <html> via CSS variables
Layout: Flexbox app shell + CSS Grid for card grids
```

---

## Color Tokens

All color values are defined as CSS custom properties on `:root` (light) and `[data-theme="dark"]` (dark) in `src/app/globals.css`.

### Semantic Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg-body` | `#f1f5f9` | `#0b1120` | `<body>` background |
| `--bg-surface` | `#ffffff` | `#0f172a` | Cards, modals, sidebar |
| `--bg-hover` | `#f8fafc` | `#1e293b` | Table row hover, nav hover |
| `--bg-input` | `#ffffff` | `#1e293b` | Input, select, textarea |
| `--text-primary` | `#0f172a` | `#e2e8f0` | Headings, body text |
| `--text-secondary` | `#475569` | `#94a3b8` | Labels, descriptions |
| `--text-muted` | `#94a3b8` | `#64748b` | Placeholders, table headers |
| `--border` | `#e2e8f0` | `#1e293b` | Borders on cards, tables, inputs |
| `--border-light` | `#f1f5f9` | `#1a2332` | Subtle separators |

### Accent & Feedback Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent` | `#3b82f6` | `#60a5fa` | Buttons, active nav, focus rings |
| `--accent-hover` | `#2563eb` | `#3b82f6` | Button hover state |
| `--danger` | `#ef4444` | `#f87171` | Delete buttons, error accents |
| `--success-bg` | `#d1fae5` | `rgba(52,211,153,0.15)` | Success badge & toast BG |
| `--success-text` | `#065f46` | `#34d399` | Success badge & toast text |
| `--warning-bg` | `#fef3c7` | `rgba(251,191,36,0.15)` | Warning badge BG |
| `--warning-text` | `#92400e` | `#fbbf24` | Warning badge text |
| `--info-bg` | `#dbeafe` | `rgba(96,165,250,0.15)` | Info badge BG |
| `--info-text` | `#1e40af` | `#60a5fa` | Info badge text |

---

## Dark Mode

### Architecture

The theme is controlled by a `data-theme` attribute on `<html>`, managed by `next-themes`:

```
<html data-theme="dark">  or  <html data-theme="light">
```

Priority order for initial theme resolution:
1. `localStorage` key `aaa_theme` (explicit user choice)
2. `prefers-color-scheme: dark` media query (OS preference)
3. Defaults to `system`

### How to Style

**Tailwind `dark:` prefix** — Uses `[data-theme="dark"]` selector (configured in `tailwind.config.ts`):

```tsx
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
```

**CSS variables** — Use in custom CSS:

```css
.my-component {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

### Theme Toggle

The toggle button lives in the header bar. It uses the View Transitions API to create a circular ripple reveal effect originating from the click position.

---

## Component Library

### Buttons

```html
<button class="btn btn-primary">Save</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-primary btn-sm">Small</button>
```

| Class | Description |
|-------|-------------|
| `.btn` | Base: inline-flex, gap, padding, rounded, 14px medium |
| `.btn-primary` | Accent background, white text |
| `.btn-danger` | Danger background, white text |
| `.btn-secondary` | Neutral bg with border, muted text |
| `.btn-sm` | Smaller padding + 12px font |

### Badges

```html
<span class="badge badge-success">Active</span>
<span class="badge badge-danger">Inactive</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-neutral">Default</span>
```

### Data Tables

```html
<div class="table-container">
  <table class="data-table">
    <thead><tr><th>Column</th></tr></thead>
    <tbody><tr><td>Value</td></tr></tbody>
  </table>
</div>
```

### Forms

```html
<div class="form-group">
  <label>Field Name</label>
  <input type="text" class="form-input" />
</div>
```

### Modals

```html
<div class="modal-overlay" onClick={onClose}>
  <div class="modal-content" onClick={e => e.stopPropagation()}>
    ...
  </div>
</div>
```

### Navigation Links

```html
<a href="/path" class="nav-link active">Link</a>
<a href="/path" class="nav-link">Link</a>
```

### Icon Buttons

```html
<button class="nav-icon-btn">
  <Icon size={18} />
</button>
```

### Spinner

In-page SVG with `.spinner` class:

```html
<svg class="spinner w-6 h-6 text-[var(--accent)]" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

---

## Responsive Breakpoints

| Prefix | Width | Typical Device |
|--------|-------|----------------|
| (none) | 0px+ | Mobile |
| `sm:` | 640px+ | Large phones |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Laptops |
| `xl:` | 1280px+ | Desktops |

---

## Convention Reference

### Always pair light and dark on backgrounds and borders:

```html
<!-- Background -->
className="bg-white dark:bg-slate-900"
<!-- Text -->
className="text-slate-900 dark:text-slate-100"
<!-- Border -->
className="border-slate-200 dark:border-slate-800"
<!-- Muted text -->
className="text-slate-500 dark:text-slate-400"
```

### Card Convention

```html
className="rounded-xl border shadow-sm
  bg-[var(--bg-surface)] border-[var(--border)] p-5"
```

### Empty State Convention

```html
<td colSpan={N} className="text-center py-8 text-[var(--text-muted)]">0/0 RECORD</td>
```
