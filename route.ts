import { ok, fail } from "@/lib/api/response";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { submissionSchema, toContributionTemplate } from "@/lib/validation/submission";

/**
 * Validation endpoint only. In this version nothing is stored or published:
 * submissions go through GitHub pull requests. The response says so explicitly.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`submissions:${clientKey(req)}`, 5, 60_000);
  if (!rl.allowed) return fail(429, "rate_limited", "Too many requests. Try again later.", undefined, { "Retry-After": String(rl.retryAfter) });
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return fail(415, "unsupported_media_type", "Send application/json.");
  const text = await req.text();
  if (text.length > 20_000) return fail(413, "payload_too_large", "Request body is too large.");
  let body: unknown;
  try { body = JSON.parse(text); } catch { return fail(400, "invalid_json", "Body is not valid JSON."); }
  const r = submissionSchema.safeParse(body);
  if (!r.success) return fail(422, "validation_failed", "Submission is invalid.", r.error.flatten().fieldErrors);
  return ok({ valid: true, stored: false, status: "not_submitted", note: "Validated only. Open a pull request with this JSON to propose it.", template: toContributionTemplate(r.data, new Date().toISOString().slice(0, 10)) });
}
