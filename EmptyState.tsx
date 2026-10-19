import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-vault-border p-8 text-center" role="status">
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-2 text-sm text-vault-muted">{children}</div> : null}
    </div>
  );
}
