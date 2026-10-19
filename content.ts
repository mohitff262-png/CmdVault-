import { z } from "zod";
import tutorialsRaw from "@/data/tutorials.json";
import troubleshootingRaw from "@/data/troubleshooting.json";

const step = z.object({ title: z.string(), command: z.string().optional(), explanation: z.string() });

export const tutorialSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  objective: z.string(),
  prerequisites: z.array(z.string()),
  steps: z.array(step).min(1),
  expectedResult: z.string(),
  troubleshooting: z.array(z.object({ problem: z.string(), fix: z.string() })),
  warnings: z.array(z.string()),
  docs: z.array(z.object({ label: z.string(), url: z.string().url() })),
  lastReviewed: z.string(),
});
export type Tutorial = z.infer<typeof tutorialSchema>;

export const troubleshootingSchema = z.object({
  slug: z.string(),
  title: z.string(),
  errorText: z.string(),
  platforms: z.array(z.string()),
  causes: z.array(z.string()),
  steps: z.array(z.object({ text: z.string(), command: z.string().optional() })),
  relatedCommands: z.array(z.string()),
});
export type TroubleshootingArticle = z.infer<typeof troubleshootingSchema>;

export const getTutorials = (): Tutorial[] => z.array(tutorialSchema).parse(tutorialsRaw);
export const getTutorial = (slug: string) => getTutorials().find((t) => t.slug === slug);
export const getTroubleshooting = (): TroubleshootingArticle[] => z.array(troubleshootingSchema).parse(troubleshootingRaw);
export const getTroubleshootingArticle = (slug: string) => getTroubleshooting().find((t) => t.slug === slug);
