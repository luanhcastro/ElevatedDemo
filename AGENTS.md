
# ElevatedDemo — Engineering Guidelines

## Project Overview

ElevatedDemo is a multi-tenant SaaS application for managing agencies and their users.

The project prioritizes security, maintainability, clean architecture, and engineering best practices over feature complexity.

## Technology Stack

- Next.js App Router
- React
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Zod
- Supabase Auth
- PostgreSQL with Row Level Security (RLS)

Supabase integration will be introduced in later issues.

## Architecture

- Follow a pragmatic modular monolith architecture.
- Organize business functionality by feature.
- Separate presentation, validation, authorization, and data access.
- Prefer React Server Components by default.
- Use Client Components only when interactivity is required.
- Keep data access behind small, typed repository interfaces where useful.
- Avoid unnecessary abstractions, generic frameworks, and premature optimization.
- Never implement functionality outside the current issue without a clear dependency.

## Code Quality

- Use TypeScript strict mode.
- Avoid `any` and unsafe type assertions.
- Use descriptive names and small, focused functions.
- Avoid duplicated business logic.
- Validate external input with Zod.
- Handle errors explicitly.
- Follow existing project conventions.
- Prefer readable code over clever solutions.
- Add dependencies only when justified.
- Do not modify unrelated code.

## UI Guidelines

- Use Tailwind CSS and shadcn/ui.
- Maintain a consistent, professional design system.
- Use reusable components where appropriate.
- Support responsive layouts.
- Use accessible form controls and dialogs.
- Provide loading, empty, error, and success states.
- Avoid unnecessary animations and visual complexity.

## Authentication and Security

These rules apply when backend integration is introduced:

- Use Supabase Auth for authentication.
- Never store plaintext passwords.
- Never expose privileged credentials to the browser.
- Enforce authorization on the server.
- Use least-privilege access.
- Enable RLS on application tables.
- Derive tenant context from authenticated server-side identity.
- Never trust client-provided agency IDs for authorization.
- Prevent cross-tenant data access and privilege escalation.
- Never log credentials or sensitive tokens.
- Do not commit secrets or real environment files.

## Multi-Tenancy

- Agencies are generic organizations, not insurance-specific entities.
- Each agency has its own users.
- Platform administrators manage agencies.
- Agency administrators manage users within their own agency.
- Tenant isolation must be enforced at the database and application layers.
- Test access using at least two separate agencies.

## Testing and Validation

For every issue:

1. Run relevant automated tests.
2. Run TypeScript type checking.
3. Run ESLint.
4. Run the production build when applicable.
5. Verify acceptance criteria.
6. Review authorization and security implications.
7. Report checks that could not be executed.

Never claim tests passed unless they were actually run.


## Documentation

- Keep README.md updated with the current project state.
- After completing each GitHub issue, append its number and title to CHANGELOG.md.
- Keep CHANGELOG.md as a simple chronological list of completed tasks.
- Do not add descriptions, technical details, or test results to the changelog.
- Never mark an incomplete issue as completed.


## Git Workflow

- Keep changes scoped to the current issue.
- Do not commit or push unless explicitly requested.
- Use clear, conventional commit messages when requested.
- Never commit secrets or generated build artifacts.

## Definition of Done

An issue is complete only when:

- Its acceptance criteria are satisfied.
- Relevant checks have been executed.
- Security implications have been reviewed.
- Documentation is updated.
- Remaining limitations are clearly reported.
