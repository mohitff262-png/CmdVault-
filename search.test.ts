import { describe, expect, it } from "vitest";
import { getAllCommands } from "@/lib/commands/repository";
import { searchCommands, tokenize } from "@/lib/commands/search";

const all = getAllCommands();

describe("search", () => {
  it("tokenizes", () => expect(tokenize("  Git  COMMIT!! ")).toEqual(["git", "commit"]));
  it("finds by name, keyword and error text", () => {
    expect(searchCommands(all, { q: "clone" }).results[0]?.slug).toBe("git-clone");
    expect(searchCommands(all, { q: "undo commit" }).results.map((c) => c.slug)).toContain("git-undo-last-commit");
    expect(searchCommands(all, { q: "permission denied publickey" }).results.map((c) => c.slug)).toContain("ssh-connect");
  });
  it("requires every term to match", () => expect(searchCommands(all, { q: "git zzzzqqq" }).total).toBe(0));
  it("filters by platform, risk and difficulty", () => {
    expect(searchCommands(all, { platform: "termux", pageSize: 100 }).results.every((c) => c.platforms.includes("termux"))).toBe(true);
    expect(searchCommands(all, { risk: "destructive", pageSize: 100 }).results.every((c) => c.risk === "destructive")).toBe(true);
    expect(searchCommands(all, { difficulty: "advanced", pageSize: 100 }).results.every((c) => c.difficulty === "advanced")).toBe(true);
  });
  it("sorts alphabetically", () => {
    const names = searchCommands(all, { sort: "name", pageSize: 100 }).results.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  it("paginates and clamps page", () => {
    const r = searchCommands(all, { pageSize: 10, page: 999 });
    expect(r.page).toBe(r.totalPages);
    expect(r.results.length).toBeLessThanOrEqual(10);
  });
  it("returns everything for an empty query", () => expect(searchCommands(all, { pageSize: 100 }).total).toBe(all.length));
});
