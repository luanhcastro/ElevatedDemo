# ElevatedDemo

ElevatedDemo is a polished application-shell demo for a future secure, multi-tenant agency management SaaS. Issue #1 establishes the visual system, responsive navigation, validation patterns, and replaceable data-access contracts without implementing a backend or claiming real authentication.

## Technology stack

- Next.js 15 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 3 and shadcn/ui conventions
- Radix UI primitives and Lucide React icons
- React Hook Form and Zod validation
- In-memory asynchronous mock repositories
- Supabase Auth and PostgreSQL with RLS are planned, not implemented

## Current functionality

- Responsive application shell with desktop sidebar, mobile navigation, page headers, active states, and a user-menu placeholder
- Demo login with email/password validation, password visibility control, loading feedback, and explicit non-authentication messaging
- Dashboard summary cards, recent activity, and mock workspace status
- Agency and user directories with search, create, edit, deactivate, confirmation dialogs, loading/error/empty states, and toast feedback
- Accessible labels, focus treatment, dialogs, menus, status text, and responsive tables

All mutations exist only in memory and reset on reload. User passwords are validated in the browser and immediately discarded; they are not logged, stored, or transmitted.

## Architecture

The application is a pragmatic, feature-oriented modular monolith. Routes and layouts compose features, reusable UI lives under `components`, feature-owned validation/types/contracts remain together, and mock implementations are isolated behind typed repositories.

```text
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/{dashboard,agencies,users}/
│   ├── globals.css
│   └── layout.tsx
├── components/{layout,shared,ui}/
├── features/
│   ├── agencies/{components,repository.ts,schemas.ts,types.ts}
│   ├── auth/{components,schemas.ts}
│   ├── dashboard/components/
│   └── users/{components,repository.ts,schemas.ts,types.ts}
└── lib/mock/{data.ts,repositories.ts}
```

`AgencyRepository` and `UserRepository` define the UI-facing asynchronous contracts. A future Supabase implementation can replace the mock repositories without changing form and table behavior. No generic service layer or dependency-injection framework is introduced.

## Prerequisites

- Node.js 18.18 or newer (Node.js 20 LTS is recommended)
- npm 9 or newer
- Git

## Installation and local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`; `/login` demonstrates the planned entry experience. No environment variables are required for Issue #1.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run typecheck` | Run strict TypeScript checking without emitting files |

Run the validation suite with `npm run lint`, `npm run typecheck`, and `npm run build`. There is not yet an automated browser or unit-test suite; CRUD flows are structured for future component and integration coverage.

## Mock-data limitations

- No API, database, session, or persistence exists; refreshing resets all changes.
- Demo sign-in accepts any values that pass client validation and does not establish an identity.
- User creation assigns a demo agency name for display only.
- Deactivation changes presentation state only and does not enforce access.
- Loading, error, and empty UI states are implemented; repository substitution can exercise errors.

## Planned security approach

Future backend issues will use Supabase Auth, server-side authorization, least-privilege access, and PostgreSQL Row Level Security. Tenant context must come from authenticated server-side identity, never a client-provided agency ID. Application tables will require RLS, cross-tenant tests with at least two agencies, and no privileged credentials in browser code. Secrets belong in ignored local environment files and managed deployment configuration, never source control.

None of those controls are represented as active in Issue #1.

## Development roadmap

- [x] Issue #1 — Application Shell & UI Design System
- [ ] Issue #2 — Database Schema & Tenant Isolation
- [ ] Issue #3 — Authentication & RBAC
- [ ] Issue #4 — Agency & User Management
- [ ] Issue #5 — Security & Integration Testing
- [ ] Issue #6 — UI Polish, Deployment & Documentation

For every future issue, update this README when behavior, setup, architecture, or requirements change and append an issue-specific entry to [CHANGELOG.md](./CHANGELOG.md). Never report a check as passing unless it was run.
