import type { Command } from "@/lib/commands/schema";
import { CommandCard } from "./CommandCard";

export function CommandList({ commands, terms }: { commands: Command[]; terms?: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {commands.map((c) => <CommandCard key={c.id} command={c} terms={terms} />)}
    </ul>
  );
}
