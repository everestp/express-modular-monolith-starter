# Express Modular Monolith Starter

A TypeScript and Express 5 starter for building a modular monolith: one API process organized into independent business modules with explicit boundaries. It includes example authentication, user-profile, and notes flows; Zod request validation; JWT access tokens; password hashing; security middleware; structured logging; and Vitest tests.

> **Current implementation status:** The API examples are functional, but their repositories are in-memory. PostgreSQL is not connected to the application yet. Migration, seed, and OpenAPI generation commands are placeholders, and there is no `/docs` route. See [Current limitations](#current-limitations) before using this as a production service.

## Contents

- [Express Modular Monolith Starter](#express-modular-monolith-starter)
  - [Contents](#contents)
  - [What is included](#what-is-included)
  - [Requirements](#requirements)
  - [Run locally](#run-locally)
  - [Configuration](#configuration)
  - [Project structure](#project-structure)
  - [Architecture and request flow](#architecture-and-request-flow)
  - [HTTP API](#http-api)
    - [Request validation](#request-validation)
    - [Example flow](#example-flow)
  - [Error responses](#error-responses)
  - [Tests and quality checks](#tests-and-quality-checks)
  - [Docker](#docker)
  - [Adding a module](#adding-a-module)
  - [Security notes](#security-notes)
  - [Current limitations](#current-limitations)
  - [License](#license)

## What is included

- **Runtime:** Node.js 20+, TypeScript in strict mode, ECMAScript modules, and Express 5.
- **Modules:** `auth`, `users`, and `notes`, each separated into domain, application, HTTP, and infrastructure concerns.
- **Authentication:** Registration and login, Argon2 password hashes, signed JWT access tokens, and bearer-token authentication.
- **Validation:** Zod schemas for auth and notes request bodies.
- **HTTP protections:** Helmet security headers, CORS, a 1 MB JSON body limit, and a process-local rate limit of 200 requests per minute.
- **Operational endpoints:** Liveness, readiness, and version endpoints.
- **Observability:** Pino-based structured logging and HTTP request logging.
- **Verification:** Vitest unit and API-flow tests using Supertest, plus TypeScript typecheck/build scripts.
- **Deployment examples:** A Dockerfile and a Docker Compose PostgreSQL service.

## Requirements

- Node.js 20 or newer. The repository includes an `.nvmrc` for a consistent local Node version.
- npm, included with Node.js.
- Docker and Docker Compose are optional and only needed to start the example PostgreSQL container.

## Run locally

```bash
git clone <repository-url> my-api
cd my-api
npm install
cp .env.example .env
npm run dev
```

The API listens on `http://localhost:3000` by default. `tsx watch` restarts the server when source files change.

Try the health endpoints:

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
curl http://localhost:3000/version
curl http://localhost:3000/api/v1/health
```

Expected responses include `{"ok":true,"status":"healthy"}` from `/healthz`, `{"ok":true,"status":"ready"}` from `/readyz`, and the service name/version/environment from `/version`.

## Configuration

Configuration is loaded from environment variables (with `.env` loaded by `dotenv`) and validated with Zod at startup.

| Variable            | Default                                           | Description                                                                                                               |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`          | `development`                                     | Runtime environment: `development`, `test`, or `production`.                                                              |
| `HOST`              | `0.0.0.0`                                         | Network interface on which the HTTP server listens.                                                                       |
| `PORT`              | `3000`                                            | HTTP port; must be an integer from 1 to 65535.                                                                            |
| `LOG_LEVEL`         | `info`                                            | Pino log level.                                                                                                           |
| `JWT_SECRET`        | `development-secret-change-me-please`             | Secret used to sign access tokens; at least 32 characters. Replace it with a strong secret outside local development.     |
| `JWT_ISSUER`        | `express-modular-monolith-starter`                | JWT issuer claim.                                                                                                         |
| `JWT_AUDIENCE`      | `starter-users`                                   | JWT audience claim.                                                                                                       |
| `ACCESS_TOKEN_TTL`  | `900000`                                          | Access-token lifetime in milliseconds (15 minutes by default).                                                            |
| `REFRESH_TOKEN_TTL` | `604800000`                                       | Reserved refresh-token lifetime in milliseconds; refresh tokens are not implemented.                                      |
| `TRUST_PROXY`       | `false`                                           | Whether Express trusts the proxy headers used to identify client IPs. Configure this deliberately behind a trusted proxy. |
| `DATABASE_URL`      | `postgres://postgres:postgres@localhost:5432/app` | Reserved database connection string; currently not used to connect to PostgreSQL.                                         |

Never commit a real `.env` file or production secrets. The defaults are for local development only.

## Project structure

```text
src/
  app.ts                         Express middleware and route composition
  main.ts                        Environment loading, server startup, shutdown hooks
  container.ts                   Dependency composition helpers
  config/                        Environment schema and configuration loader
  core/
    errors/                      Shared application error types
    http/                        Shared HTTP schemas
    logger/                      Pino logger setup
    middleware/                  Authentication, validation, error and 404 handlers
    security/                    Password hashing and access-token creation
    types/                       Express request type augmentation
  modules/
    auth/
      domain/                    Auth user types, repository port, auth errors
      application/               Registration, login, and current-user use cases
      http/                      Auth routes, controllers, and request schemas
      infrastructure/            In-memory auth repository
    users/                       User profile module with the same layer boundaries
    notes/                       Notes module with the same layer boundaries
  versions/
    v1.ts                        Wires modules under `/api/v1`
tests/
  unit/                          Service and HTTP flow tests
  e2e/                           End-to-end API flow test
scripts/                         Migration, seed, and OpenAPI command entry points
migrations/                      SQL migration example
api/openapi.json                 OpenAPI artifact in the repository
deploy/                          Dockerfile and PostgreSQL Compose service
.github/workflows/ci.yml         GitHub Actions typecheck, test, and build job
```

## Architecture and request flow

This is a **modular monolith**, not a collection of separately deployed services. Modules run in one process and can call their own application/domain logic directly. Their public `index.ts` files are the intended entry points for the rest of the application.

The common direction of dependencies is:

```text
HTTP route/controller -> application service -> domain port
                                             ^
                                             |
                                  infrastructure adapter
```

- **HTTP layer:** Express routers bind paths, authentication, and validation; controllers translate between HTTP requests/responses and application calls.
- **Application layer:** Services implement use cases and coordinate domain operations. For example, `NotesService` enforces note ownership.
- **Domain layer:** Module-owned types, errors, and repository interfaces (ports). It does not depend on Express or a database client.
- **Infrastructure layer:** Repository implementations. The current implementations store data in process memory; they are examples, not durable persistence.
- **Composition:** `src/versions/v1.ts` creates the module routers and mounts them under `/api/v1`; `src/app.ts` installs shared middleware and mounts the versioned router.

An in-memory repository resets whenever the process restarts and is not shared between multiple server processes. The interfaces are designed to allow a database adapter later, but `pg` being installed and a SQL file being present do not mean the API currently uses PostgreSQL.

## HTTP API

All business routes are under `/api/v1`. JSON request bodies are limited to 1 MB. Authenticated endpoints require `Authorization: Bearer <access-token>`.

| Method   | Path                    | Auth required | Purpose                                                                       |
| -------- | ----------------------- | ------------- | ----------------------------------------------------------------------------- |
| `GET`    | `/healthz`              | No            | Process liveness check.                                                       |
| `GET`    | `/readyz`               | No            | Readiness endpoint; currently does not verify a real database connection.     |
| `GET`    | `/version`              | No            | Service name, version, and environment.                                       |
| `GET`    | `/api/v1/health`        | No            | Versioned API health check.                                                   |
| `POST`   | `/api/v1/auth/register` | No            | Register with an email and password; returns a user and access token (`201`). |
| `POST`   | `/api/v1/auth/login`    | No            | Verify credentials; returns a user and access token.                          |
| `GET`    | `/api/v1/auth/me`       | Yes           | Return the authenticated user's profile.                                      |
| `GET`    | `/api/v1/users/me`      | Yes           | Return the authenticated user's profile through the users module.             |
| `GET`    | `/api/v1/notes`         | Yes           | List notes owned by the authenticated user.                                   |
| `POST`   | `/api/v1/notes`         | Yes           | Create a note (`201`).                                                        |
| `GET`    | `/api/v1/notes/:id`     | Yes           | Get an owned note.                                                            |
| `PATCH`  | `/api/v1/notes/:id`     | Yes           | Update one or both note fields.                                               |
| `DELETE` | `/api/v1/notes/:id`     | Yes           | Delete an owned note (`204`).                                                 |

### Request validation

- Registration and login require a valid `email` and a `password` of at least 8 characters.
- Note creation requires a non-empty `title` (maximum 200 characters) and non-empty `content` (maximum 10,000 characters).
- Note updates accept either or both fields. The same field limits apply when supplied.
- Emails are normalized to lowercase and trimmed before they are stored or looked up. Note title and content are trimmed by the service.
- A user's notes are scoped to that user. Reading another user's note returns not found; attempting to update or delete another user's note returns forbidden.

### Example flow

Register, then copy the returned `accessToken` into the `TOKEN` variable to call a protected route:

```bash
curl -i http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"alex@example.com","password":"a-long-local-password"}'

export TOKEN='<access-token-from-the-response>'

curl -i http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"First note","content":"A note stored in memory."}'

curl -i http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer $TOKEN"
```

Registration returns `{ "user": { "id", "email" }, "accessToken": "..." }`. Note endpoints wrap data in a `note` or `notes` property.

## Error responses

Application errors use a problem-details-style JSON body:

```json
{
  "type": "https://example.com/problems/invalid_credentials",
  "title": "invalid credentials",
  "status": 401,
  "detail": "Invalid credentials",
  "instance": "/api/v1/auth/login"
}
```

Validation failures currently return `400` with `{ "error": "Validation failed", "issues": ... }`. Common application errors include duplicate registration (`409`), invalid credentials (`401`), missing resources (`404`), and forbidden note updates/deletes (`403`).

## Tests and quality checks

```bash
npm test                 # Run all Vitest tests
npm run test:unit        # Run tests/unit
npm run test:e2e         # Run tests/e2e
npm run typecheck        # Type-check without emitting files
npm run build            # Compile to dist/
npm run lint             # Currently blocked: no eslint.config.* is present
```

The current tests exercise service behavior, auth and notes HTTP flows, ownership rules, and health endpoints. They use in-memory repositories; there is no live-PostgreSQL integration test suite yet. The `test:integration` script is present for future integration tests, but no integration tests are currently included.

The `lint` script invokes ESLint 9, but the repository currently has no flat config file (`eslint.config.js`, `.mjs`, or `.cjs`), so the command exits with a configuration error until one is added.

CI runs on pushes to `main` and pull requests using Node.js 20. It installs dependencies, type-checks, runs tests, and builds the project.

## Docker

Start the optional PostgreSQL example service:

```bash
npm run docker:up
```

This starts PostgreSQL 16 on port `5432` with the local development database/user/password from `deploy/docker-compose.yml`. It does **not** make the API database-backed yet.

Build the API image from the repository root:

```bash
docker build -f deploy/Dockerfile -t express-modular-monolith-starter .
```

The image exposes port `3000`. Provide required environment variables at container runtime; do not bake secrets into the image. The Dockerfile currently uses `npm install`, builds the TypeScript project, and runs `dist/main.js`.

## Adding a module

1. Create a module directory under `src/modules/<name>/` with `domain/`, `application/`, `http/`, and `infrastructure/` folders as needed.
2. Define module-owned domain types, errors, and repository ports without importing Express or storage clients into the domain layer.
3. Implement use cases in application services against those ports.
4. Add an infrastructure adapter that implements the ports. Add unit tests for the service and adapter behavior where appropriate.
5. Add request schemas, controllers, and a router in the HTTP layer.
6. Expose a module factory from `index.ts`, then mount it in `src/versions/v1.ts`.
7. Add route-level or end-to-end tests for the public behavior and update this README's API table.

Keep cross-module access explicit through public module exports rather than importing another module's internal files.

## Security notes

- Replace `JWT_SECRET` with a randomly generated secret of at least 32 characters in every non-development environment.
- Keep `.env` files and secrets out of version control and logs.
- Configure `TRUST_PROXY` only when the app is behind a known, correctly configured reverse proxy.
- Review the permissive CORS configuration, rate-limit strategy, and default limits against your deployment and threat model before exposing the service publicly.
- This repository is a starter, not a security certification. Add operational monitoring, secret management, dependency updates, and deployment-specific controls before production use.

## Current limitations

- Auth and notes use in-memory repositories. Data disappears on restart and is not shared across instances.
- `DATABASE_URL` is validated but not used by the app. `src/main.ts` currently supplies a stub query dependency, so `/readyz` is not a real database readiness check.
- `migrations/0001_create_users.sql` is an example SQL file; it is not automatically applied and is not wired to the repositories. The current in-memory user model uses UUIDs, while this example migration uses a serial integer key.
- `npm run migrate:up`, `npm run migrate:down`, `npm run migrate:create`, `npm run seed`, and `npm run openapi` are placeholder commands.
- `REFRESH_TOKEN_TTL` is parsed as configuration, but there is no refresh-token endpoint or refresh-token storage.
- There is no Swagger UI or `/docs` route. `api/openapi.json` is not generated by the current placeholder script and may not describe the implemented API.
- The example rate limiter is process-local; it is not a shared distributed limit across multiple server instances.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE).
