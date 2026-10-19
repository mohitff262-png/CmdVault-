import type { ReactNode } from "react";

const tones = {
  neutral: "border-vault-border text-vault-muted",
  accent: "border-vault-accent/40 text-vault-accent",
  safe: "border-vault-ok/40 text-vault-ok",
  caution: "border-vault-warn/40 text-vault-warn",
  destructive: "border-vault-danger/50 text-vault-danger",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof tones }) {
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}
