import { getAllCommands, getCategories } from "../src/lib/commands/repository";
import { getTroubleshooting, getTutorials } from "../src/lib/content";

try {
  const cmds = getAllCommands();
  const cats = new Set(getCategories().map((c) => c.slug));
  const slugs = new Set(cmds.map((c) => c.slug));
  const problems: string[] = [];
  for (const c of cmds) {
    if (!cats.has(c.category)) problems.push(`${c.slug}: unknown category`);
    for (const r of c.related) if (!slugs.has(r) && !cmds.some((x) => x.id === r)) problems.push(`${c.slug}: unknown related "${r}"`);
  }
  for (const t of getTroubleshooting()) for (const r of t.relatedCommands) if (!slugs.has(r)) problems.push(`troubleshooting/${t.slug}: unknown command "${r}"`);
  getTutorials();
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  console.log(`OK: ${cmds.length} commands, ${getTutorials().length} tutorials, ${getTroubleshooting().length} troubleshooting articles.`);
} catch (e) {
  console.error(e);
  process.exit(1);
}
