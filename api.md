# API (v1)

All responses: `{ "data": ..., "meta": ... }` or `{ "error": { "code", "message", "details?" } }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/v1/health` | `{ status: "ok" }` |
| GET | `/api/v1/commands` | Query: `q, platform, category, difficulty, risk, sort, page, pageSize`. Invalid enum values return 400. |
| GET | `/api/v1/commands/{slug}` | 200, 400 (bad slug), 404 |
| GET | `/api/v1/categories` | With counts |
| GET | `/api/v1/search?q=` | `q` required (max 200 chars) |
| POST | `/api/v1/submissions` | **Validation only.** Returns `stored: false` and a JSON template for a pull request. 422 on invalid input, 429 when rate limited (5/min/IP, in memory). |
| POST | `/api/v1/reports` | Validates and returns a prefilled GitHub issue URL. Nothing is stored. |

Not implemented: persistence, moderation queues, authentication, favorites/collections sync.
