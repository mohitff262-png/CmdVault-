import { beforeEach, describe, expect, it } from "vitest";
import { GET as listCommands } from "@/app/api/v1/commands/route";
import { GET as getCommand } from "@/app/api/v1/commands/[slug]/route";
import { GET as search } from "@/app/api/v1/search/route";
import { GET as health } from "@/app/api/v1/health/route";
import { POST as submit } from "@/app/api/v1/submissions/route";
import { resetRateLimits } from "@/lib/api/rate-limit";

const get = (p: string) => new Request(`http://t${p}`);
const post = (body: unknown, ip = "1.1.1.1") => new Request("http://t/api/v1/submissions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: typeof body === "string" ? body : JSON.stringify(body) });
const valid = { name: "Test command", description: "Does a useful test thing.", explanation: "A longer explanation of the test command.", category: "git", syntax: "git test", exampleCommand: "git test -v", exampleDescription: "Verbose test", platforms: ["linux"], difficulty: "beginner", risk: "safe", sources: ["https://git-scm.com/docs"] };

beforeEach(() => resetRateLimits());

describe("API", () => {
  it("health", async () => expect((await (await health()).json()).data.status).toBe("ok"));
  it("lists commands with pagination meta", async () => {
    const j = await (await listCommands(get("/api/v1/commands?pageSize=5"))).json();
    expect(j.data).toHaveLength(5);
    expect(j.meta.total).toBeGreaterThan(50);
  });
  it("rejects invalid filter values", async () => expect((await listCommands(get("/api/v1/commands?platform=amiga"))).status).toBe(400));
  it("command lookup 200 / 404 / 400", async () => {
    const p = (slug: string) => ({ params: Promise.resolve({ slug }) });
    expect((await getCommand(get("/x"), p("git-clone"))).status).toBe(200);
    expect((await getCommand(get("/x"), p("missing"))).status).toBe(404);
    expect((await getCommand(get("/x"), p("BAD SLUG"))).status).toBe(400);
  });
  it("search requires q", async () => {
    expect((await search(get("/api/v1/search"))).status).toBe(400);
    expect((await (await search(get("/api/v1/search?q=docker"))).json()).data.length).toBeGreaterThan(0);
  });
  it("submissions: validates, never claims storage", async () => {
    const res = await submit(post(valid));
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.data.stored).toBe(false);
    expect((await submit(post({ ...valid, name: "" }))).status).toBe(422);
    expect((await submit(post({ ...valid, website: "spam" }))).status).toBe(422);
    expect((await submit(post("{bad"))).status).toBe(400);
  });
  it("submissions are rate limited", async () => {
    let last = 0;
    for (let i = 0; i < 7; i++) last = (await submit(post(valid, "9.9.9.9"))).status;
    expect(last).toBe(429);
  });
});
