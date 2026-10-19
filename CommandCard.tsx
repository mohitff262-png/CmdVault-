import Link from "next/link";
import type { Command } from "@/lib/commands/schema";
import { Badge } from "@/components/ui/Badge";
import { Highlight } from "@/components/search/Highlight";

export function CommandCard({ command, terms = [] }: { command: Command; terms?: string[] }) {
  return (
    <li>
      <Link href={`/commands/${command.slug}`} className="block h-full rounded-lg border border-vault-border bg-vault-surface p-4 transition-colors hover:border-vault-accent">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium"><Highlight text={command.name} terms={terms} /></h3>
          {command.risk !== "safe" ? <Badge tone={command.risk}>{command.risk}</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-vault-muted"><Highlight text={command.description} terms={terms} /></p>
        <code className="mt-3 block truncate rounded bg-vault-bg px-2 py-1 font-mono text-xs text-vault-muted"><Highlight text={command.syntax} terms={terms} /></code>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="accent">{command.category}</Badge>
          <Badge>{command.difficulty}</Badge>
          {command.platforms.map((p) => <Badge key={p}>{p}</Badge>)}
        </div>
      </Link>
    </li>
  );
}
