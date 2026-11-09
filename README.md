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
- Supabase email/password authentication with cookie-backed SSR sessions and explicit error states
- Server-side route authorization for platform and agency administrators
- Role-aware desktop and mobile navigation with functional local-session logout
- Dashboard summary cards, recent activity, and mock workspace status
- Agency and user directories with search, create, edit, deactivate, confirmation dialogs, loading/error/empty states, and toast feedback
- Accessible labels, focus treatment, dialogs, menus, status text, and responsive tables

Agency and user management mutations still exist only in memory and reset on reload. Credentials are
sent directly to Supabase Auth over its client SDK and are never logged or stored in application
tables.

Issue #3 authenticates administrators and protects routes, while the CRUD repositories remain mock
implementations until Issue #4.

## Architecture

The application is a pragmatic, feature-oriented modular monolith. Routes and layouts compose features, reusable UI lives under `components`, feature-owned validation/types/contracts remain together, and mock implementations are isolated behind typed repositories.

```text
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/{dashboard,agencies,users}/
│   ├── access-denied/
│   ├── globals.css
│   └── layout.tsx
├── components/{layout,shared,ui}/
├── features/
│   ├── agencies/{components,repository.ts,schemas.ts,types.ts}
│   ├── auth/{components,actions,authorization,schemas,types}
│   ├── dashboard/components/
│   └── users/{components,repository.ts,schemas.ts,types.ts}
├── lib/
│   ├── mock/{data.ts,repositories.ts}
│   └── supabase/{client,config,middleware,server}.ts
└── types/database.ts
middleware.ts
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

## Authentication and authorization

The application uses `@supabase/ssr` for cookie-backed sessions. The browser client performs
email/password sign-in, Next.js middleware refreshes expiring cookies, and Server Components call
`supabase.auth.getUser()` to verify identity with Supabase Auth before rendering protected content.
Middleware does not authorize routes by itself.

Public signup and anonymous sign-in are disabled in the committed local Supabase configuration.
Disable **Allow new users to sign up** and anonymous sign-ins in the hosted project's Auth settings
as an operational prerequisite; the application exposes no signup endpoint or UI.

Server authorization calls `public.get_my_authorization_context()`, a caller-scoped
`security definer` function added in the Issue #3 migration. It reads only trusted profile,
membership, agency, and platform-administrator records and returns only the current user's own
context. It uses an empty search path, is unavailable to `anon`, and fails closed in the application
when data is missing or inconsistent.

| Route        | Unauthenticated   | Platform administrator | Agency administrator      | Member/no role |
| ------------ | ----------------- | ---------------------- | ------------------------- | -------------- |
| `/login`     | Allowed           | Redirect to dashboard  | Redirect to dashboard     | Access denied  |
| `/dashboard` | Redirect to login | Allowed                | Allowed                   | Access denied  |
| `/agencies`  | Redirect to login | Allowed                | Access denied             | Access denied  |
| `/users`     | Redirect to login | Access denied          | Allowed for active agency | Access denied  |

Soft-deleted agencies resolve with no agency-level access. Navigation follows the same role matrix
for usability, but Server Component guards remain the authoritative application control and RLS
remains the data-access control.

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

Open [http://localhost:3000](http://localhost:3000). The root route redirects to the protected
dashboard, and unauthenticated requests are redirected to `/login`.

Copy the environment template for future local Supabase integration:

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the existing project's
API settings. These are the only variables used by the running application. Never put a secret key,
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

| Command                            | Purpose                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                      | Start the local development server                                   |
| `npm run build`                    | Create an optimized production build                                 |
| `npm run start`                    | Serve the production build                                           |
| `npm test`                         | Run isolated authentication and authorization tests                  |
| `npm run provision:platform-admin` | Provision the first administrator from trusted environment variables |
| `npm run format`                   | Format supported repository files with Prettier                      |
| `npm run format:check`             | Verify that supported files match the Prettier configuration         |
| `npm run lint`                     | Run ESLint with zero warnings allowed                                |
| `npm run typecheck`                | Run strict TypeScript checking without emitting files                |

Run the validation suite with `npm test`, `npm run format:check`, `npm run lint`,
`npm run typecheck`, and `npm run build`. Unit tests mock external Auth operations and verify
application decisions; they do not replace pgTAP RLS tests or live Auth testing.

## Initial platform administrator provisioning

First apply the new authorization-context migration through the reviewed Supabase migration
workflow. Then run the provisioning script only from a trusted administrator workstation. It uses
the Auth Admin API with `email_confirm: true`, creates the matching profile and platform role, sends
no email, and attempts to remove the Auth user if database provisioning fails.

Prompt for sensitive values so they are not stored in shell history:

```bash
export SUPABASE_URL='https://your-project-ref.supabase.co'
read -rsp 'Supabase secret key: ' SUPABASE_SECRET_KEY && echo
read -rp 'Administrator email: ' INITIAL_PLATFORM_ADMIN_EMAIL
read -rsp 'Initial password: ' INITIAL_PLATFORM_ADMIN_PASSWORD && echo
read -rp 'Administrator name: ' INITIAL_PLATFORM_ADMIN_NAME
export SUPABASE_SECRET_KEY INITIAL_PLATFORM_ADMIN_EMAIL
export INITIAL_PLATFORM_ADMIN_PASSWORD INITIAL_PLATFORM_ADMIN_NAME

npm run provision:platform-admin

unset SUPABASE_SECRET_KEY INITIAL_PLATFORM_ADMIN_EMAIL
unset INITIAL_PLATFORM_ADMIN_PASSWORD INITIAL_PLATFORM_ADMIN_NAME
```

The secret key must never use a `NEXT_PUBLIC_*` name, enter source control, or be deployed to the
browser. Do not expose the provisioning script through an HTTP route. Agency administrator
provisioning remains a trusted manual operation until Issue #4.

### Manual authentication verification

After applying the migration and provisioning test accounts:

1. Sign in with invalid credentials and confirm the generic error remains on `/login`.
2. Sign in as a platform administrator and verify `/dashboard` and `/agencies` work while `/users`
   is denied.
3. Sign in as an active agency administrator and verify `/dashboard` and `/users` work while
   `/agencies` is denied.
4. Confirm regular members, missing memberships, and soft-deleted agency administrators reach the
   access-denied screen.
5. Refresh a protected page to verify session continuity, then sign out and confirm protected routes
   redirect to `/login`.

### Editor formatting

The repository includes shared VS Code settings that use the Prettier extension as the default
formatter, format supported files on save, and apply ESLint fixes on save. Install the
`esbenp.prettier-vscode` and `dbaeumer.vscode-eslint` extensions to use this automation. Prettier
also sorts Tailwind CSS classes through `prettier-plugin-tailwindcss`.

## Mock-data limitations

- Authentication and route authorization are real, but agency and user CRUD remains in memory.
- User creation assigns a demo agency name for display only.
- Deactivation changes presentation state only and does not enforce access.
- Loading, error, and empty UI states are implemented; repository substitution can exercise errors.
- Live authentication requires the Issue #3 migration and manually provisioned Auth users in the
  target Supabase project.
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

Issue #3 connects only authentication and authorization. It does not replace the mock CRUD
repositories or expose privileged database keys to normal application requests.

## Development roadmap

- [x] Issue #1 — Application Shell & UI Design System
- [x] Issue #2 — Database Schema & Tenant Isolation
- [x] Issue #3 — Authentication & RBAC
- [ ] Issue #4 — Agency & User Management
- [ ] Issue #5 — Security & Integration Testing
- [ ] Issue #6 — UI Polish, Deployment & Documentation

For every future issue, update this README when behavior, setup, architecture, or requirements change and append an issue-specific entry to [CHANGELOG.md](./CHANGELOG.md). Never report a check as passing unless it was run.
