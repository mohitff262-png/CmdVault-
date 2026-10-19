import { describe, expect, it } from "vitest";
import { parseFavorites, toggleFavorite } from "@/lib/storage/favorites";
import { addToCollection, createCollection, deleteCollection, emptyCollections, parseCollections, removeFromCollection, renameCollection } from "@/lib/storage/collections";
import { exportCollections, importCollections, mergeCollections } from "@/lib/storage/import-export";

describe("favorites", () => {
  it("recovers from corrupt data", () => {
    expect(parseFavorites("{not json")).toEqual([]);
    expect(parseFavorites('["Bad Slug"]')).toEqual([]);
    expect(parseFavorites(null)).toEqual([]);
  });
  it("toggles", () => expect(toggleFavorite(toggleFavorite([], "a"), "a")).toEqual([]));
});

describe("collections", () => {
  it("supports the full lifecycle", () => {
    let s = createCollection(emptyCollections(), "  Deploy  ", "1", "2026-01-01");
    expect(s.collections[0]?.name).toBe("Deploy");
    s = addToCollection(addToCollection(s, "1", "git-clone"), "1", "git-clone");
    expect(s.collections[0]?.commandSlugs).toEqual(["git-clone"]);
    s = renameCollection(s, "1", "Ship");
    expect(s.collections[0]?.name).toBe("Ship");
    s = removeFromCollection(s, "1", "git-clone");
    expect(s.collections[0]?.commandSlugs).toEqual([]);
    expect(deleteCollection(s, "1").collections).toEqual([]);
  });
  it("ignores empty names and corrupt storage", () => {
    expect(createCollection(emptyCollections(), "   ", "1", "x").collections).toEqual([]);
    expect(parseCollections('{"version":2}')).toEqual(emptyCollections());
  });
  it("round-trips export and import and rejects invalid files", () => {
    const s = addToCollection(createCollection(emptyCollections(), "A", "1", "2026-01-01"), "1", "git-clone");
    const r = importCollections(exportCollections(s));
    expect(r.ok && r.data.collections).toEqual(s.collections);
    expect(importCollections("nope").ok).toBe(false);
    expect(importCollections('{"version":1,"collections":[{"id":1}]}').ok).toBe(false);
  });
  it("merges by id", () => {
    const a = createCollection(emptyCollections(), "A", "1", "t");
    const b = createCollection(createCollection(emptyCollections(), "A2", "1", "t"), "B", "2", "t");
    expect(mergeCollections(a, b).collections.map((c) => c.name)).toEqual(["A2", "B"]);
  });
});
