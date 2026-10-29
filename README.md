# Express Modular Monolith Starter

An open-source, production-minded Express 5 + TypeScript + PostgreSQL starter. It is a modular monolith: one deployable app made of independent modules (`auth`, `users`, `notes`) with clean layers, raw SQL, API versioning, structured logging, tests, Docker, and CI.

## 1. Why this starter

- Express 5 with native async error handling
- Zod-centric validation and schema-driven typing
- Raw SQL with `pg`
- Clean modular monolith boundaries
- Tests, linting, Docker, and release tooling included

## 2. Quick start

```bash
git clone <your-repo-url> my-api && cd my-api
cp .env.example .env
npm install
npm run dev
```

Swagger UI will be available at http://localhost:3000/docs once the docs layer is enabled.

## 3. Structure

```text
src/
  app.ts
  main.ts
  container.ts
  config/
  core/
  modules/
  versions/
```

## 4. Maintainer notes

This starter intentionally keeps the app simple and testable while following a layered architecture. Add new modules by mirroring the existing `auth`, `users`, and `notes` patterns, and wire them through the versioned router.

## 5. License

MIT
