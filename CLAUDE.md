# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlow API is a NestJS-based backend service for a portfolio operations platform. It provides REST APIs for managing organizations, projects, tasks, users, and subscriptions with role-based access control (RBAC).

**Key tech stack:**
- **Framework:** NestJS 11 (TypeScript)
- **Database:** PostgreSQL with Prisma 7 ORM
- **Authentication:** JWT tokens with bcrypt password hashing
- **Validation:** class-validator + class-transformer
- **Testing:** Jest with supertest for e2e tests
- **Documentation:** Swagger/OpenAPI available at `/api`

## Setup & Commands

### Initial Setup
```bash
npm install
# Set DATABASE_URL in .env (PostgreSQL connection string required)
npm run seed  # Seed initial data (optional)
```

### Development
```bash
npm run start:dev         # Run with auto-reload on file changes
npm run start:debug       # Debug mode with inspector
npm run build             # Build production bundle
npm run start:prod        # Run compiled bundle
```

### Testing
```bash
npm run test              # Run unit tests
npm run test:watch        # Watch mode for tests
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests
npm run test:debug        # Debug tests with inspector
```

### Code Quality
```bash
npm run lint              # Run ESLint with auto-fix
npm run format            # Format code with Prettier
```

### Database
```bash
npx prisma migrate dev --name <migration_name>  # Create + apply migration
npx prisma migrate deploy                        # Apply migrations (production)
npx prisma db push                               # Quick schema sync (dev only)
npx prisma studio                                # Open visual database browser
npm run seed                                     # Run src/prisma/seed.ts
```

## Architecture

### Module Structure
The app is organized into domain-driven modules under `src/`:

- **auth/** - JWT authentication, login/register endpoints, auth guards
- **users/** - User CRUD operations
- **organizations/** - Organization management, member invitations, subscription
- **projects/** - Project CRUD within organizations
- **tasks/** - Task management (create, update, move between statuses)
- **authorization/** - Permission checks, RBAC decorators, permission guards
- **prisma/** - Database connection & service (global provider)

Each module typically contains:
- `*.module.ts` - Module definition with imports/providers
- `*.service.ts` - Business logic and database queries
- `*.controller.ts` - HTTP endpoints and request handling
- `dto/` - Data transfer objects for validation
- `*.spec.ts` - Unit/controller tests

### Data Model

The Prisma schema (`src/prisma/schema.prisma`) defines 7 core models:

- **User** - Email, name, password hash; has memberships in organizations and assigned tasks
- **Organization** - Contains projects, members, subscription, activities, and invitations
- **OrganizationMember** - Junction model linking users to organizations with RBAC roles
- **Project** - Belongs to an organization; contains tasks
- **Task** - Title, description, status (TODO/IN_PROGRESS/REVIEW/DONE), assigned user
- **Subscription** - Organization subscription plan (FREE/PRO) with Stripe integration
- **Activity** - Audit log for organization actions (user, action, entityType, entityId)

**Key enums:**
- `OrganizationRole`: OWNER, ADMIN, MANAGER, MEMBER, VIEWER
- `TaskStatus`: TODO, IN_PROGRESS, REVIEW, DONE
- `SubscriptionPlan`: FREE, PRO
- `SubscriptionStatus`: ACTIVE, PAST_DUE, CANCELED

### Authentication & Authorization

1. **AuthService** - Issues JWT tokens on login; validates credentials with bcrypt
2. **AuthGuard** - Extracts and validates JWT from headers; attaches user to request
3. **PermissionGuard** - Checks role-based permissions using decorators on endpoints
4. **Permissions** - Map of required roles for each operation (defined in `authorization/permissions.ts`)

Routes are protected with `@UseGuards(AuthGuard)` and `@RequirePermission(action, resource)`.

### CORS & Cookies

- CORS enabled for `http://localhost:3000` (frontend URL in main.ts)
- Cookies parsed via `cookie-parser` middleware
- Global `ValidationPipe` whitelist/forbid unknown properties, transform DTOs to typed objects

## Important Patterns

### Database Queries
- Use Prisma's select/include to minimize data exposure (never leak passwordHash)
- Handle `PrismaClientKnownRequestError` for unique constraint violations (code 'P2002')
- Use cascading deletes in relations to clean up orphaned records

### DTOs & Validation
- Define DTOs in `<module>/dto/` with class-validator decorators
- Nest's global pipe auto-validates and transforms; returns 400 on invalid input
- Always map sensitive fields in service (exclude passwordHash from responses)

### Error Handling
- Use NestJS exceptions: `BadRequestException`, `UnauthorizedException`, `ConflictException`, `NotFoundException`
- HTTP status codes are set automatically by exception type
- Prisma errors are caught and re-thrown as NestJS exceptions

### Testing
- Unit tests in `*.service.spec.ts` mock dependencies
- Controller tests in `*.controller.spec.ts` mock services
- E2E tests in `test/app.e2e-spec.ts` hit real endpoints
- Use `@nestjs/testing` module factory for test setup

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string (required for any Prisma operation)
- `JWT_SECRET` - Secret key for signing JWTs (used by NestJS JWT strategy)
- `PORT` - Server port (defaults to 3001)

## Key Files Reference

- `src/main.ts` - App bootstrap, Swagger setup, middleware config, CORS
- `src/app.module.ts` - Global imports and module registrations
- `src/prisma/schema.prisma` - Data model definition
- `src/authorization/permissions.ts` - Permission/role mappings
- `src/auth/auth.module.ts` - JWT strategy configuration

## Development Notes

- **Prisma Client:** Custom output in `src/generated/prisma/` (generated from schema.prisma)
- **Base URL:** Swagger docs at `http://localhost:3001/api`
- **Database adapter:** Using `@prisma/adapter-pg` for better PostgreSQL support (Prisma 7)
- **Modular structure:** Add new features as separate modules following existing pattern
- **Error responses:** All exceptions return JSON with statusCode, message, error fields
