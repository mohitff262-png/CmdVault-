import { describe, expect, it } from "vitest";
import { getAllCommands, getCommandBySlug, parseCommands } from "@/lib/commands/repository";
import { commandSchema } from "@/lib/commands/schema";
import { getRelatedCommands } from "@/lib/commands/related";

describe("dataset", () => {
  it("loads and validates every entry with unique slugs", () => {
    const all = getAllCommands();
    expect(all.length).toBeGreaterThan(50);
    expect(new Set(all.map((c) => c.slug)).size).toBe(all.length);
  });
  it("rejects invalid entries", () => {
    expect(commandSchema.safeParse({ slug: "Bad Slug" }).success).toBe(false);
  });
  it("rejects duplicate slugs", () => {
    const c = getAllCommands()[0]!;
    expect(() => parseCommands([c, c])).toThrow(/Duplicate/);
  });
  it("looks up by slug", () => {
    expect(getCommandBySlug("git-clone")?.category).toBe("git");
    expect(getCommandBySlug("nope")).toBeUndefined();
  });
  it("finds related commands without the command itself", () => {
    const c = getCommandBySlug("git-commit")!;
    const rel = getRelatedCommands(c, getAllCommands());
    expect(rel.length).toBeGreaterThan(0);
    expect(rel.find((r) => r.id === c.id)).toBeUndefined();
  });
});
