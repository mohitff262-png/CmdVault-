import { AlertTriangle } from "lucide-react";
import type { Command } from "@/lib/commands/schema";

export function RiskWarning({ risk }: { risk: Command["risk"] }) {
  if (risk === "safe") return null;
  const destructive = risk === "destructive";
  return (
    <div role="note" className={`flex gap-3 rounded-lg border p-3 text-sm ${destructive ? "border-vault-danger/50 bg-vault-danger/10" : "border-vault-warn/40 bg-vault-warn/10"}`}>
      <AlertTriangle size={18} aria-hidden className={destructive ? "text-vault-danger" : "text-vault-warn"} />
      <p>
        {destructive
          ? "Destructive: this command can permanently delete or overwrite data. Read the explanation, check every path, and make a backup first."
          : "Use with care: this command changes state or exposes something. Make sure you understand the options before running it."}
      </p>
    </div>
  );
}
