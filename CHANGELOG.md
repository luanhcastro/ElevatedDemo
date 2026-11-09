# Changelog

All notable project changes are recorded by completed GitHub issue. This format is inspired by Keep a Changelog.

## [Issue #1 — Application Shell & UI Design System] - 2026-11-09

### Added

- Bootstrapped a strict Next.js 15 App Router application with React 19, TypeScript, Tailwind CSS, ESLint, a `src` directory, and `@/*` imports.
- Added the ElevatedDemo design system, code-drawn arrow mark, responsive navigation, header, user-menu placeholder, and reusable shadcn-style UI primitives.
- Added demo login, dashboard, agency management, and user management routes.
- Added Zod-validated forms, loading/error/empty states, confirmation dialogs, toast feedback, search, and functional in-memory create/edit/deactivate flows.
- Added realistic isolated mock records and asynchronous typed agency/user repository contracts.
- Added `.gitignore`, `.env.example`, and project documentation.

### Architecture

- Adopted a feature-oriented modular monolith with route composition, shared primitives, feature-owned schemas/types/contracts, and isolated mock access.
- Kept interactive workspaces as Client Components while page composition remains server-rendered.
- Defined repository seams for later Supabase implementations without a generic service layer.
- Validated and discarded demo passwords without persistence, logging, or network transport.

### Dependencies

- Next.js, React, TypeScript, Tailwind CSS, PostCSS, Autoprefixer, and ESLint.
- Radix UI dialog, dropdown-menu, label, slot, and toast primitives.
- shadcn/ui utilities, Lucide React, Zod, React Hook Form, and the Zod resolver.

### Relevant paths

- `src/app`, `src/components`, `src/features`, and `src/lib/mock`
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, and `components.json`
- `AGENTS.md`, `README.md`, `CHANGELOG.md`, `.env.example`, and `.gitignore`

### Validation

- `npm install` — completed; 410 packages installed. npm reported 9 dependency advisories (7 moderate, 2 high) for follow-up review.
- `npm audit --omit=dev` — completed and reported 3 production-tree advisories (1 moderate, 2 high) in Next.js's bundled PostCSS and Zod; npm's proposed fixes require breaking major upgrades.
- `npm run lint` — passed with zero warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed; all application routes generated successfully.
- Production route smoke test — `/login`, `/dashboard`, `/agencies`, and `/users` returned HTTP 200; `/` returned the expected HTTP 307 redirect.
- Automated browser and CRUD integration tests — not available in this issue; not run.

### Known limitations

- Authentication, authorization, persistence, Supabase, database schema, migrations, and RLS are intentionally absent.
- Mock state resets on reload; demo sign-in does not create a session.
- User creation uses a fixed display agency because assignment and tenant enforcement belong to later issues.
- UI states do not have automated visual coverage yet.
- The current Node 18-compatible dependency set has three production-tree advisories; remediation requires coordinated Next.js/Node and Zod/resolver major upgrades.

### Follow-up

- Review dependency advisories and upgrade the runtime/toolchain as compatibility permits.
- Implement database schema and tenant isolation in Issue #2 only.
- Add component and end-to-end coverage when the testing strategy is introduced.
