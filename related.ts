import type { Command } from "./schema";

/** Related commands: explicit `related` ids first, then same category with the most shared tags. */
export function getRelatedCommands(command: Command, all: Command[], limit = 4): Command[] {
  const explicit = command.related.map((id) => all.find((c) => c.id === id || c.slug === id)).filter((c): c is Command => Boolean(c));
  const tags = new Set([...command.tags, ...command.keywords]);
  const scored = all
    .filter((c) => c.id !== command.id && !explicit.includes(c))
    .map((c) => ({ c, score: (c.category === command.category ? 2 : 0) + [...c.tags, ...c.keywords].filter((t) => tags.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name));
  return [...explicit, ...scored.map((x) => x.c)].slice(0, limit);
}
