import { z } from "zod";

export const FAVORITES_KEY = "cmdvault:favorites:v1";
const schema = z.array(z.string().regex(/^[a-z0-9-]+$/)).max(2000);

/** Returns a clean list; corrupt or invalid data yields an empty list. */
export function parseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const r = schema.safeParse(JSON.parse(raw));
    return r.success ? [...new Set(r.data)] : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(list: string[], slug: string): string[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}
