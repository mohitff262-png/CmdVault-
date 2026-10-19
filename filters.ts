import type { Command } from "./schema";

export interface Filters {
  platform?: string;
  category?: string;
  difficulty?: string;
  risk?: string;
  tool?: string;
}

export function applyFilters(commands: Command[], f: Filters): Command[] {
  return commands.filter(
    (c) =>
      (!f.platform || (c.platforms as string[]).includes(f.platform)) &&
      (!f.category || c.category === f.category) &&
      (!f.difficulty || c.difficulty === f.difficulty) &&
      (!f.risk || c.risk === f.risk) &&
      (!f.tool || c.tools.includes(f.tool)),
  );
}

export function activeFilterCount(f: Filters): number {
  return Object.values(f).filter(Boolean).length;
}
