import { CopyButton } from "./CopyButton";

export function CommandCodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg border border-vault-border bg-vault-surface">
      <div className="flex items-center justify-between border-b border-vault-border px-3 py-1.5">
        <span className="text-xs text-vault-muted">{label ?? "Command"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed" tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}
