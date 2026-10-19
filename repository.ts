import git from "@/data/commands/git.json";
import linux from "@/data/commands/linux.json";
import termux from "@/data/commands/termux.json";
import nodejs from "@/data/commands/nodejs.json";
import npm from "@/data/commands/npm.json";
import python from "@/data/commands/python.json";
import docker from "@/data/commands/docker.json";
import ssh from "@/data/commands/ssh.json";
import deployment from "@/data/commands/deployment.json";
import categoriesRaw from "@/data/categories.json";
import { commandListSchema, categorySchema, type Category, type Command } from "./schema";
import { z } from "zod";

/**
 * Data access layer. The rest of the app only calls these functions, so a
 * database-backed implementation can replace the JSON loading later.
 */
let cache: Command[] | null = null;

export function parseCommands(raw: unknown): Command[] {
  const list = commandListSchema.parse(raw);
  const slugs = new Set<string>();
  for (const c of list) {
    if (slugs.has(c.slug)) throw new Error(`Duplicate command slug: ${c.slug}`);
    slugs.add(c.slug);
  }
  return list;
}

export function getAllCommands(): Command[] {
  if (!cache) cache = parseCommands([...git, ...linux, ...termux, ...nodejs, ...npm, ...python, ...docker, ...ssh, ...deployment]);
  return cache;
}

export function getCommandBySlug(slug: string): Command | undefined {
  return getAllCommands().find((c) => c.slug === slug);
}

export function getCategories(): Category[] {
  return z.array(categorySchema).parse(categoriesRaw);
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getCommandsByCategory(slug: string): Command[] {
  return getAllCommands().filter((c) => c.category === slug);
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of getAllCommands()) counts[c.category] = (counts[c.category] ?? 0) + 1;
  return counts;
}
