# ElevatedDemo

ElevatedDemo is a secure multi-tenant SaaS application for managing agencies and their users. It
uses real Supabase authentication and PostgreSQL data, with authorization enforced on the server
and tenant isolation enforced by Row Level Security (RLS).

## Technology stack

- Next.js 15 App Router and React 19
- TypeScript strict mode
- Tailwind CSS and shadcn/ui conventions
- React Hook Form and Zod
- Supabase Auth, PostgreSQL, and RLS
- npm, ESLint, Prettier, Vitest, and pgTAP

## Current functionality

- Supabase email/password login, cookie-backed SSR sessions, logout, and protected routes
- Role-aware navigation for platform and agency administrators
- Real database dashboard counts with explicit unavailable states
- Platform-admin agency listing, creation, and read-only agency user drill-down
- Agency-admin tenant user listing and secure Auth user provisioning
- Loading, empty, success, validation, and error states
- Responsive desktop and mobile application shell

There is no public registration. Editing, deletion, deactivation, pagination, and advanced
filtering are intentionally outside the MVP.

## Architecture

The application is a feature-oriented modular monolith. App Router pages compose feature modules,
interactive workspaces remain Client Components, and all authentication and data mutations pass
through server-side authorization.

```text
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/dashboard/
│   ├── (dashboard)/agencies/[agencyId]/users/
│   ├── (dashboard)/users/
│   └── access-denied/
├── components/{layout,shared,ui}/
├── features/{agencies,auth,dashboard,users}/
├── lib/supabase/{admin,client,config,middleware,server}.ts
└── types/database.ts
supabase/
├── migrations/
└── tests/database/
```

Small typed repository contracts isolate feature data access. Normal reads and agency writes use
the authenticated Supabase client so RLS remains authoritative. User provisioning first verifies
the caller and derives the tenant from trusted membership data, then uses a server-only Supabase
secret client for the Auth Admin API and linked profile/membership records. Partial provisioning
attempts delete the newly created Auth user, whose foreign-key cascades remove linked records.

### Architectural trade-offs

- The MVP performs one Auth Admin lookup per listed user because email belongs to `auth.users`, not
  the public profile table. This keeps credentials and identity fields in Supabase Auth at the cost
  of an acceptable small-directory N+1 lookup.
- Platform administrators can read profiles and memberships for dashboard counts and agency user
  drill-down, but cannot mutate them through RLS. The drill-down is intentionally read-only.
- Dashboard metrics query live data on each server render. No cache or analytics layer is added for
  the interview-sized dataset.
- User creation spans Auth and PostgreSQL rather than a distributed transaction. Compensating Auth
  deletion handles database failures and treats cleanup failures as failed operations without
  exposing sensitive details to the browser.

## Multi-tenancy and RBAC

Supabase Auth owns credentials in `auth.users`. Application data uses these tables:

| Table                       | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `public.agencies`           | Tenant organizations with soft deletion   |
| `public.profiles`           | User display names keyed to Auth user IDs |
| `public.agency_memberships` | One agency and tenant role per MVP user   |
| `public.platform_admins`    | Trusted platform-wide administrators      |

RLS is explicitly enabled on every application table. Anonymous users cannot read protected data.
Platform administrators manage agencies and can read agency membership data, but cannot create or
change tenant users. Agency administrators can read and provision users only in their own active
agency. Regular members have no administrative route access. Tenant identity is resolved from the
verified session and database membership; client-provided IDs never establish authorization.

Privileged SQL helpers use `security definer` only where needed, an empty `search_path`, fully
qualified relations, and minimum execution grants. The application never treats service-role
access as evidence that RLS works; pgTAP tests exercise authenticated and anonymous database roles.

## Local setup

Prerequisites: Node.js 20 LTS or newer, npm, Supabase CLI, and Docker for the local Supabase stack.

```bash
npm install
cp .env.example .env.local
supabase start
supabase db reset --local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To link the existing hosted project without
creating a new one:

```bash
supabase login
supabase link --project-ref <existing-project-ref>
supabase migration list --remote
```

Review migrations and backups before running `supabase db push --remote`. Never reset the remote
database and never commit generated `supabase/.temp` state.

## Environment variables

Configure these names locally and in Vercel; never commit their real values:

| Variable                               | Exposure     | Purpose                       |
| -------------------------------------- | ------------ | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Browser-safe | Existing Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe | Publishable/anon API key      |
| `SUPABASE_SECRET_KEY`                  | Server only  | Auth Admin user provisioning  |

The one-time `provision:platform-admin` script additionally uses `SUPABASE_URL`,
`INITIAL_PLATFORM_ADMIN_EMAIL`, `INITIAL_PLATFORM_ADMIN_PASSWORD`, and
`INITIAL_PLATFORM_ADMIN_NAME` on a trusted administrator workstation. Never prefix secret keys or
passwords with `NEXT_PUBLIC_`.

## Commands and validation

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Database security validation requires the local Supabase stack:

```bash
supabase db reset --local
supabase test db
```

The pgTAP suite verifies platform permissions, two-tenant isolation, forbidden cross-tenant
mutations, anonymous denial, role-escalation denial, and deactivated-agency restrictions.

## Vercel deployment

1. Apply the reviewed migrations to the existing Supabase project through the controlled CLI
   workflow.
2. In Supabase Auth, add the production Vercel origin and required redirect URLs. Keep public and
   anonymous signups disabled.
3. Import the repository into Vercel and configure the three runtime environment variables above
   for the appropriate environments.
4. Use Node.js 20 or newer and run `npm run build` before deployment.
5. Deploy, then verify login/logout, session refresh, both administrator roles, agency creation,
   tenant user creation, and cross-tenant denial with dedicated non-production accounts.

No localhost URL is used by application authentication or management workflows. Do not expose the
secret key to Preview logs, browser bundles, or client-side environment variables.

## Roadmap

- [x] Issue #1 — Application Shell & UI Design System
- [x] Issue #2 — Supabase Database Schema & Tenant Isolation
- [x] Issue #3 — Authentication & Role-Based Access Control
- [x] Issue #4 — Supabase-backed Agency and User Management
- [x] Issue #5 — Final Fixes, Validation & Deployment Readiness

For every future issue, update this README when behavior, setup, architecture, or requirements
change and append a concise issue entry to `CHANGELOG.md` without overwriting prior entries.
