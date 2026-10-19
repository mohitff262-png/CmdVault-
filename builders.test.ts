import { describe, expect, it } from "vitest";
import { BUILDERS, defaultValues, getBuilder } from "@/lib/builders";
import { shellQuote } from "@/lib/builders/quote";

const run = (slug: string, v: Record<string, string | boolean>) => {
  const d = getBuilder(slug)!;
  return d.build({ ...defaultValues(d), ...v });
};

describe("builders", () => {
  it("quotes unsafe strings", () => {
    expect(shellQuote("a b")).toBe("'a b'");
    expect(shellQuote("it's")).toBe(`'it'\\''s'`);
    expect(shellQuote("safe/path.txt")).toBe("safe/path.txt");
  });
  it("builds git clone", () => {
    expect(run("git-clone", { url: "https://github.com/u/r.git", branch: "dev", depth: "1" }).command).toBe("git clone --branch dev --depth 1 https://github.com/u/r.git");
  });
  it("rejects shell injection in the clone URL", () => {
    expect(run("git-clone", { url: "https://x.com/a; rm -rf /" }).errors.length).toBeGreaterThan(0);
    expect(run("git-clone", { url: "https://x.com/a.git", directory: "--upload-pack=evil" }).errors.length).toBeGreaterThan(0);
  });
  it("quotes commit messages", () => expect(run("git-commit", { message: "fix: it's $HOME" }).command).toContain("-m 'fix: it'\\''s $HOME'"));
  it("warns on force delete and amend", () => {
    expect(run("git-branch", { action: "force-delete", name: "old" }).warnings.length).toBe(1);
    expect(run("git-commit", { message: "x", amend: true }).warnings.length).toBe(1);
  });
  it("builds docker run with warnings for public ports", () => {
    const r = run("docker-run", { image: "nginx:alpine", port: "8080:80" });
    expect(r.command).toBe("docker run -d -p 8080:80 nginx:alpine");
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it("validates ssh input", () => {
    expect(run("ssh", { user: "deploy", host: "203.0.113.10", port: "2222" }).command).toBe("ssh -p 2222 deploy@203.0.113.10");
    expect(run("ssh", { user: "x;y", host: "h" }).errors.length).toBeGreaterThan(0);
  });
  it("refuses dangerous deletes", () => expect(run("file-ops", { op: "rmdir", a: "/" }).errors.length).toBeGreaterThan(0));
  it("every builder has defaults and does not throw on empty input", () => {
    for (const b of BUILDERS) expect(() => b.build(defaultValues(b))).not.toThrow();
  });
});
