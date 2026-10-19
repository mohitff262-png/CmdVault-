import { z } from "zod";
import { difficultySchema, categorySlugSchema, platformSchema, riskSchema } from "@/lib/commands/schema";

/** Invalid optional values are ignored rather than crashing the page. */
const opt = <T extends z.ZodTypeAny>(s: T) => s.optional().catch(undefined);

export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
  platform: opt(platformSchema),
  category: opt(categorySlugSchema),
  difficulty: opt(difficultySchema),
  risk: opt(riskSchema),
  sort: z.enum(["relevance", "name", "recent"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).optional().catch(undefined),
  pageSize: z.coerce.number().int().min(1).max(100).optional().catch(undefined),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

type Raw = Record<string, string | string[] | undefined>;
export function parseSearchQuery(raw: Raw | URLSearchParams): SearchQuery {
  const obj: Record<string, string | undefined> = {};
  if (raw instanceof URLSearchParams) raw.forEach((v, k) => { obj[k] = v; });
  else for (const [k, v] of Object.entries(raw)) obj[k] = Array.isArray(v) ? v[0] : v;
  return searchQuerySchema.parse(obj);
}
