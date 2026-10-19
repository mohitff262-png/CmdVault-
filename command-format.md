# Command data format

Files live in `src/data/commands/<category>.json` as arrays validated by `src/lib/commands/schema.ts`.

Required: `id` (`<category>-<slug>`), `slug`, `name`, `description` (10-300 chars), `explanation`, `category`, `syntax`, `examples` (>=1), `platforms`, `difficulty`, `risk`, `sources` (https URLs), `lastReviewed` (YYYY-MM-DD).
Optional: `subcategory`, `tools`, `prerequisites`, `expectedOutput`, `commonErrors[{message, fix}]`, `troubleshooting`, `related`, `keywords`, `tags`, `versionNotes`, `contributor`, `featured`.

Rules: mark `risk: "destructive"` for anything that deletes or overwrites data; do not use `sudo` in Termux entries; cite official docs. Run `npm run validate:data` before opening a PR.
