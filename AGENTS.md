<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CréditoÁgil RD — Agent Guide

## Quick Start

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # build + typecheck (use for verification, no separate typecheck cmd)
npm run lint       # ESLint 9 flat config
```

- `npm run build` runs TSC + build. No separate `typecheck` or `test` commands exist.
- All pages are `'use client'` static exports (no API routes, no SSR).
- Next.js 16.2.10 with Turbopack.

## Architecture

- **State**: React Context + `useReducer` in `context/LoanSystemContext.tsx` (1030 lines). Persists to `localStorage`. Includes seed data with RD clients, loans, and cash transactions.
- **Routing**: Next.js App Router. Pages at `app/{page}/page.tsx`.
- **Design system**: Defined in `app/globals.css` via `@theme inline` (Tailwind v4 no tailwind.config).
  - Cards: `glass-card` (translucent, hover), `glass-card-static` (translucent, static), `glass-card-solid` (white, Stitch design)
  - Buttons: `btn-primary`, `btn-secondary`
  - Inputs: `input-glass`
  - Tables: `table-header`, `table-header-right`, `table-header-center`
- **Path alias**: `@/` maps to repo root (`@/types`, `@/lib/amortization`, etc.)

## Key Libraries

- `lib/currency.ts` — `formatRD()` / `parseRD()` for DOP formatting
- `lib/cedula-validator.ts` — JCE algorithm for RD cédula validation
- `lib/amortization.ts` — French + Simple interest calculation
- `lib/dominican-holidays.ts` — RD holiday calendar (nextBusinessDay)
- `@/types/index.ts` — All system types (Loan, Client, Installment, etc.)
- Tailwind CSS v4, PostCSS via `@tailwindcss/postcss`, no `tailwind.config.js`

## Conventions

- **Typography**: Plus Jakarta Sans for headings (`--font-heading`), Inter for body (`--font-body`), Public Sans for labels.
- **Colors**: Primary `#2563eb` (blue), Secondary `#10b981` (emerald), Tertiary `#4f46e5` (indigo).
- **Borders**: Use `border-slate-200/40` for section dividers (not `border-slate-100`).
- **Icons**: Lucide-style inline SVG components in `components/ui/Icons.tsx`.
- All pages are `'use client'` — no async server components.
- No unit tests, no E2E tests — verify with `npm run build`.
- Stitch-generated screen designs in `stitch-screens/` directory (may be empty).
