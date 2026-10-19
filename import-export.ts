import { collectionsStateSchema, type CollectionsState } from "./collections";

export function exportCollections(s: CollectionsState): string {
  return JSON.stringify({ ...s, exportedAt: new Date().toISOString(), app: "cmdvault" }, null, 2);
}

export type ImportResult = { ok: true; data: CollectionsState } | { ok: false; error: string };

export function importCollections(text: string): ImportResult {
  if (text.length > 1_000_000) return { ok: false, error: "File is too large (limit 1 MB)." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }
  const r = collectionsStateSchema.safeParse(parsed);
  if (!r.success) return { ok: false, error: `Not a CmdVault collections export: ${r.error.issues[0]?.message ?? "invalid structure"}.` };
  return { ok: true, data: r.data };
}

/** Merge imported collections into existing ones; matching ids are replaced. */
export function mergeCollections(current: CollectionsState, incoming: CollectionsState): CollectionsState {
  const map = new Map(current.collections.map((c) => [c.id, c]));
  for (const c of incoming.collections) map.set(c.id, c);
  return { version: 1, collections: [...map.values()] };
}
