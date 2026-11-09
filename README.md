# ElevatedDemo

ElevatedDemo is a polished application-shell demo for a future secure, multi-tenant agency management SaaS. Issue #1 establishes the visual system, responsive navigation, validation patterns, and replaceable data-access contracts without implementing a backend or claiming real authentication.

## Technology stack

- Next.js 15 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 3 and shadcn/ui conventions
- Radix UI primitives and Lucide React icons
- React Hook Form and Zod validation
- In-memory asynchronous mock repositories for the Issue #1 UI
- Version-controlled Supabase/PostgreSQL schema with Row Level Security

## Current functionality

- Responsive application shell with desktop sidebar, mobile navigation, page headers, active states, and a user-menu placeholder
- Demo login with email/password validation, password visibility control, loading feedback, and explicit non-authentication messaging
- Dashboard summary cards, recent activity, and mock workspace status
- Agency and user directories with search, create, edit, deactivate, confirmation dialogs, loading/error/empty states, and toast feedback
- Accessible labels, focus treatment, dialogs, menus, status text, and responsive tables

All mutations exist only in memory and reset on reload. User passwords are validated in the browser and immediately discarded; they are not logged, stored, or transmitted.

Issue #2 adds the database schema and tenant-isolation policies, but the frontend remains on mock
repositories until a later integration issue.

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
supabase/
├── config.toml
├── migrations/
└── tests/database/
```

`AgencyRepository` and `UserRepository` define the UI-facing asynchronous contracts. A future Supabase implementation can replace the mock repositories without changing form and table behavior. No generic service layer or dependency-injection framework is introduced.

## Supabase architecture

The database is defined by ordered SQL migrations under `supabase/migrations`. Supabase Auth owns
credentials in `auth.users`; no application table stores passwords.

| Table                       | Purpose                                   | Important relationships                                                |
| --------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `public.agencies`           | Tenant organizations with soft deletion   | Parent of agency memberships                                           |
| `public.profiles`           | Application identity data                 | Primary key references `auth.users.id`                                 |
| `public.agency_memberships` | User-to-agency assignment and tenant role | References one agency and one profile; `user_id` is unique for the MVP |
| `public.platform_admins`    | Trusted platform-wide administrators      | Primary key references `auth.users.id`                                 |

Deleting an Auth user cascades to their profile, membership, and platform-admin marker. Agencies are
never cascaded into Auth accounts: authenticated platform administrators deactivate an agency by
setting `deleted_at`, and physical agency deletion is not granted through the Data API. Membership
tenant and user identifiers are immutable; reassignment requires an explicit trusted delete/insert
workflow.

### Tenant isolation model

- RLS is explicitly enabled on all four application tables.
- Anonymous access has no table privileges or policies.
- Platform administrators can list, create, update, deactivate, and reactivate agencies. They are
  recognized through a private predicate and cannot mutate `platform_admins` through an
  authenticated request.
- Active agency members can view their own agency and membership. Users can view and edit their own
  profile.
- Agency administrators can view profiles and memberships only in their own active agency. They can
  create, update, or delete other memberships in that agency, but cannot change their own role or
  move a membership between agencies.
- Regular members cannot perform tenant-administration mutations.
- Soft-deleted agencies fail all membership/admin predicates, immediately blocking tenant data
  access while preserving each user's own identity profile.
- RLS predicates derive the caller from `auth.uid()`; client-provided agency identifiers are never
  trusted as authorization evidence.

Recursive membership policies are avoided with narrowly scoped `security definer` predicates in
the non-exposed `private` schema. Each privileged function has an empty search path, uses fully
qualified relations, and grants execution only to `authenticated` when RLS needs it.

## Prerequisites

- Node.js 18.18 or newer (Node.js 20 LTS is recommended)
- npm 9 or newer
- Git
- Supabase CLI
- A Docker-compatible container runtime for the local Supabase stack

## Installation and local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`; `/login` demonstrates the planned entry experience. No environment variables are required for Issue #1.

Copy the environment template for future local Supabase integration:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the existing project's
API settings. These public values are not consumed by Issue #2 yet. Never put a secret key,
service-role key, database password, or Supabase access token in a `NEXT_PUBLIC_*` variable.

### Local database development

The committed configuration was initialized for local development and does not identify or create a
hosted project.

```bash
supabase start
supabase db reset --local
supabase test db
```

`supabase db reset --local` rebuilds only the local database and reapplies all migrations. The test
suite under `supabase/tests/database` runs pgTAP assertions under realistic `authenticated` and
`anon` roles.

To associate this checkout with the Supabase project that already exists:

```bash
supabase login
supabase link --project-ref <existing-project-ref>
supabase migration list --remote
```

The project reference is visible in the existing Dashboard URL. Login tokens, database passwords,
and generated CLI state must remain local. Linking does not apply the migration. After reviewing the
remote migration list and backup strategy, applying migrations is a separate, explicit operation:

```bash
supabase db push --remote
```

Never use `supabase db reset --remote` against production; it is destructive. No remote database
command is required for normal local validation.

## Available scripts

| Command                | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the local development server                           |
| `npm run build`        | Create an optimized production build                         |
| `npm run start`        | Serve the production build                                   |
| `npm run format`       | Format supported repository files with Prettier              |
| `npm run format:check` | Verify that supported files match the Prettier configuration |
| `npm run lint`         | Run ESLint with zero warnings allowed                        |
| `npm run typecheck`    | Run strict TypeScript checking without emitting files        |

Run the validation suite with `npm run format:check`, `npm run lint`, `npm run typecheck`, and
`npm run build`. There is not yet an automated browser or unit-test suite; CRUD flows are
structured for future component and integration coverage.

### Editor formatting

The repository includes shared VS Code settings that use the Prettier extension as the default
formatter, format supported files on save, and apply ESLint fixes on save. Install the
`esbenp.prettier-vscode` and `dbaeumer.vscode-eslint` extensions to use this automation. Prettier
also sorts Tailwind CSS classes through `prettier-plugin-tailwindcss`.

## Mock-data limitations

- No API, database, session, or persistence exists; refreshing resets all changes.
- Demo sign-in accepts any values that pass client validation and does not establish an identity.
- User creation assigns a demo agency name for display only.
- Deactivation changes presentation state only and does not enforce access.
- Loading, error, and empty UI states are implemented; repository substitution can exercise errors.
- The UI does not query the Supabase schema yet and no login session is established.
- Platform administrators must be provisioned through a trusted operational path; authenticated
  users cannot create or edit `platform_admins` records.
- Membership creation assumes the target Auth user and profile already exist. Secure user
  provisioning belongs to a later authentication/backend issue.

## Security approach

The database now enforces tenant access using PostgreSQL RLS and least-privilege grants. Future
backend issues must use Supabase Auth and server-side authorization while preserving these database
controls. Tenant context comes from authenticated identity, never a client-provided agency ID.
Secrets belong in ignored local environment files and managed deployment configuration, never
source control.

Issue #2 does not connect the browser to Supabase, implement authentication, or replace the mock
repositories. Database policies must be validated locally before any remote migration is applied.

## Development roadmap

- [x] Issue #1 — Application Shell & UI Design System
- [x] Issue #2 — Database Schema & Tenant Isolation
- [ ] Issue #3 — Authentication & RBAC
- [ ] Issue #4 — Agency & User Management
- [ ] Issue #5 — Security & Integration Testing
- [ ] Issue #6 — UI Polish, Deployment & Documentation

For every future issue, update this README when behavior, setup, architecture, or requirements change and append an issue-specific entry to [CHANGELOG.md](./CHANGELOG.md). Never report a check as passing unless it was run.
