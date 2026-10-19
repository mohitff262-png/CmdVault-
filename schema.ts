import { z } from "zod";

export const CATEGORY_SLUGS = ["git", "linux", "termux", "nodejs", "npm", "python", "docker", "ssh", "deployment"] as const;
export const PLATFORMS = ["linux", "macos", "windows", "termux"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export const RISKS = ["safe", "caution", "destructive"] as const;

export const categorySlugSchema = z.enum(CATEGORY_SLUGS);
export const platformSchema = z.enum(PLATFORMS);
export const difficultySchema = z.enum(DIFFICULTIES);
export const riskSchema = z.enum(RISKS);

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const slugString = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const commandSchema = z.object({
  id: z.string().min(1),
  slug: slugString,
  name: z.string().min(1).max(120),
  description: z.string().min(10).max(300),
  explanation: z.string().min(20),
  category: categorySlugSchema,
  subcategory: z.string().optional(),
  syntax: z.string().min(1),
  examples: z.array(z.object({ command: z.string().min(1), description: z.string().min(1), output: z.string().optional() })).min(1),
  platforms: z.array(platformSchema).min(1),
  tools: z.array(z.string()).default([]),
  difficulty: difficultySchema,
  risk: riskSchema,
  prerequisites: z.array(z.string()).default([]),
  expectedOutput: z.string().optional(),
  commonErrors: z.array(z.object({ message: z.string(), fix: z.string() })).default([]),
  troubleshooting: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sources: z.array(z.string().url()).min(1),
  lastReviewed: dateString,
  versionNotes: z.string().optional(),
  contributor: z.string().optional(),
  featured: z.boolean().default(false),
});

export type Command = z.infer<typeof commandSchema>;
export type CommandInput = z.input<typeof commandSchema>;
export const commandListSchema = z.array(commandSchema);

export const categorySchema = z.object({ slug: categorySlugSchema, name: z.string(), description: z.string() });
export type Category = z.infer<typeof categorySchema>;
