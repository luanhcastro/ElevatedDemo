
# ElevatedDemo

A secure, multi-tenant SaaS application for managing agencies and their users.

Built with Next.js, TypeScript, and Supabase, with a focus on clean architecture, maintainability, and tenant isolation.

## Overview

ElevatedDemo is a technical demonstration project designed to showcase full-stack engineering practices.

The application supports two administrative roles:

- **Platform Administrator:** Manages agencies.
- **Agency Administrator:** Manages users belonging to their agency.

The MVP intentionally keeps the business domain simple to emphasize architecture, authentication, authorization, and security.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Zod | Input validation |
| Supabase Auth | Authentication (planned) |
| PostgreSQL | Database (planned) |
| PostgreSQL RLS | Tenant isolation (planned) |

## Architecture

The application follows a feature-oriented modular monolith architecture.

Main architectural principles:

- Clear separation of concerns
- Reusable UI components
- Typed data access
- Server-side authorization
- Database-enforced tenant isolation
- Minimal dependencies

## Project Structure

The project structure will be documented here after the initial application bootstrap.

## Getting Started

### Prerequisites

- Node.js (current supported LTS version)
- npm
- Git

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Open http://localhost:3000.

### Validation

The available validation scripts will be documented after project initialization.

## Functional Scope

### Platform Administrator

- Create agencies
- List agencies
- Update agency information
- Deactivate agencies

### Agency Administrator

- Create agency users
- List agency users
- Update user information
- Deactivate agency users

## Data Model

### Agency

- ID
- Name
- Contact email

### User

- ID
- Name
- Email
- Password (managed by Supabase Auth)

Agency membership and role information will be stored separately.

## Security Approach

The planned implementation includes:

- Supabase Auth
- Role-Based Access Control
- Server-side authorization
- PostgreSQL Row Level Security
- Tenant isolation
- Secure administrative account provisioning

Security features must not be described as implemented until they are verified.

## Development Roadmap

- [ ] Issue #1 — Application Shell & UI Design System
- [ ] Issue #2 — Database Schema & Tenant Isolation
- [ ] Issue #3 — Authentication & RBAC
- [ ] Issue #4 — Agency & User Management
- [ ] Issue #5 — Security & Integration Testing
- [ ] Issue #6 — UI Polish, Deployment & Documentation

## Current Limitations

The first development phase uses mock data.

Authentication, persistent data, and tenant isolation will be implemented in subsequent issues.

## AI-Assisted Development

OpenAI Codex is used to assist with implementation.

Architectural decisions, security requirements, code review, and acceptance criteria remain subject to developer verification.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for implementation history, technical decisions, and validation results.
