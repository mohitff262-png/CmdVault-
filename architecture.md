# Architecture

- `src/lib/commands/repository.ts` is the only place that loads data. Replace its internals with a database query layer later (e.g. Prisma/PostgreSQL); pages and API routes call only its functions.
- Search runs in memory on the server (`search.ts`); the UI is plain GET forms, so URLs are shareable and it works without JavaScript.
- Client state (favorites, collections) is isolated in `src/lib/storage` + `src/hooks`, validated with Zod, and never touched during SSR.
- Builders (`src/lib/builders`) are pure functions with allowlist regexes and POSIX quoting. No `eval`, no server execution.
- Rate limiter is in memory (single instance only).
