import { z } from "zod";
import { categorySlugSchema, difficultySchema, platformSchema, riskSchema } from "@/lib/commands/schema";

const noCtl = (s: string) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(s);

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(120).refine(noCtl, "Contains control characters"),
  description: z.string().trim().min(10).max(300).refine(noCtl),
  explanation: z.string().trim().min(20).max(4000).refine(noCtl),
  category: categorySlugSchema,
  syntax: z.string().trim().min(1).max(500).refine(noCtl),
  exampleCommand: z.string().trim().min(1).max(500).refine(noCtl),
  exampleDescription: z.string().trim().min(3).max(300).refine(noCtl),
  platforms: z.array(platformSchema).min(1, "Pick at least one platform"),
  difficulty: difficultySchema,
  risk: riskSchema,
  sources: z.array(z.string().url("Must be a valid URL").startsWith("https://", "Use https:// links")).min(1, "Add at least one source").max(5),
  contributor: z.string().trim().max(80).optional(),
  /** Honeypot: real users never fill this. */
  website: z.string().max(0, "Spam detected").optional(),
});

export type Submission = z.infer<typeof submissionSchema>;

export const reportSchema = z.object({
  commandSlug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  reason: z.enum(["outdated", "incorrect", "unsafe", "other"]),
  details: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
});
export type Report = z.infer<typeof reportSchema>;

/** Contribution JSON in the same shape as the data files, ready for a pull request. */
export function toContributionTemplate(s: Submission, today: string) {
  const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return {
    id: `${s.category}-${slug}`,
    slug,
    name: s.name,
    description: s.description,
    explanation: s.explanation,
    category: s.category,
    syntax: s.syntax,
    examples: [{ command: s.exampleCommand, description: s.exampleDescription }],
    platforms: s.platforms,
    difficulty: s.difficulty,
    risk: s.risk,
    sources: s.sources,
    lastReviewed: today,
    ...(s.contributor ? { contributor: s.contributor } : {}),
  };
}
