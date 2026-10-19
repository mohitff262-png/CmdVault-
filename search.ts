import type { Command } from "./schema";
import { applyFilters, type Filters } from "./filters";

export type SortMode = "relevance" | "name" | "recent";

export interface SearchOptions extends Filters {
  q?: string;
  sort?: SortMode;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  results: Command[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  terms: string[];
}

export function tokenize(q: string | undefined): string[] {
  return (q ?? "").toLowerCase().split(/[^a-z0-9_.:+-]+/).filter(Boolean).slice(0, 8);
}

const has = (hay: string, t: string) => hay.toLowerCase().includes(t);

/** Weighted match score. Every term must match somewhere, otherwise the score is 0. */
export function scoreCommand(c: Command, terms: string[]): number {
  if (terms.length === 0) return 1;
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (has(c.name, t)) s += c.name.toLowerCase() === t ? 14 : 10;
    if (has(c.syntax, t)) s += 6;
    if (c.keywords.some((k) => k === t)) s += 7;
    else if (c.keywords.some((k) => has(k, t))) s += 4;
    if (c.tags.some((k) => has(k, t))) s += 3;
    if (has(c.description, t)) s += 3;
    if (c.examples.some((e) => has(e.command, t))) s += 3;
    if (c.commonErrors.some((e) => has(e.message, t))) s += 4;
    if (has(c.category, t) || c.platforms.some((p) => p === t)) s += 2;
    if (has(c.explanation, t)) s += 1;
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

export function searchCommands(all: Command[], opts: SearchOptions = {}): SearchResult {
  const terms = tokenize(opts.q);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 1), 100);
  const filtered = applyFilters(all, opts);
  let scored = filtered.map((c, index) => ({ c, index, score: scoreCommand(c, terms) })).filter((x) => x.score > 0);
  const sort = opts.sort ?? "relevance";
  if (sort === "name") scored.sort((a, b) => a.c.name.localeCompare(b.c.name));
  else if (sort === "recent") scored.sort((a, b) => b.c.lastReviewed.localeCompare(a.c.lastReviewed) || a.index - b.index);
  else scored.sort((a, b) => b.score - a.score || Number(b.c.featured) - Number(a.c.featured) || a.index - b.index);
  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(opts.page ?? 1, 1), totalPages);
  scored = scored.slice((page - 1) * pageSize, page * pageSize);
  return { results: scored.map((x) => x.c), total, page, pageSize, totalPages, terms };
}
