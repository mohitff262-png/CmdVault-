import { z } from "zod";

export const COLLECTIONS_KEY = "cmdvault:collections:v1";

export const collectionSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(80),
  createdAt: z.string(),
  commandSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(500),
});
export const collectionsStateSchema = z.object({
  version: z.literal(1),
  collections: z.array(collectionSchema).max(200),
});
export type Collection = z.infer<typeof collectionSchema>;
export type CollectionsState = z.infer<typeof collectionsStateSchema>;

export const emptyCollections = (): CollectionsState => ({ version: 1, collections: [] });

export function parseCollections(raw: string | null): CollectionsState {
  if (!raw) return emptyCollections();
  try {
    const r = collectionsStateSchema.safeParse(JSON.parse(raw));
    return r.success ? r.data : emptyCollections();
  } catch {
    return emptyCollections();
  }
}

const cleanName = (n: string) => n.trim().slice(0, 80);

export function createCollection(s: CollectionsState, name: string, id: string, now: string): CollectionsState {
  const n = cleanName(name);
  if (!n) return s;
  return { ...s, collections: [...s.collections, { id, name: n, createdAt: now, commandSlugs: [] }] };
}

export function renameCollection(s: CollectionsState, id: string, name: string): CollectionsState {
  const n = cleanName(name);
  if (!n) return s;
  return { ...s, collections: s.collections.map((c) => (c.id === id ? { ...c, name: n } : c)) };
}

export function deleteCollection(s: CollectionsState, id: string): CollectionsState {
  return { ...s, collections: s.collections.filter((c) => c.id !== id) };
}

export function addToCollection(s: CollectionsState, id: string, slug: string): CollectionsState {
  return { ...s, collections: s.collections.map((c) => (c.id === id && !c.commandSlugs.includes(slug) ? { ...c, commandSlugs: [...c.commandSlugs, slug] } : c)) };
}

export function removeFromCollection(s: CollectionsState, id: string, slug: string): CollectionsState {
  return { ...s, collections: s.collections.map((c) => (c.id === id ? { ...c, commandSlugs: c.commandSlugs.filter((x) => x !== slug) } : c)) };
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
