import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base = "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors disabled:opacity-50";
const variants = {
  primary: "bg-vault-accentStrong text-white hover:bg-vault-accent",
  secondary: "border border-vault-border bg-vault-raised text-vault-text hover:border-vault-accent",
  ghost: "text-vault-muted hover:text-vault-text",
  danger: "border border-vault-danger/50 text-vault-danger hover:bg-vault-danger/10",
};
type Variant = keyof typeof variants;

export function Button({ variant = "secondary", className = "", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...p} />;
}

export function LinkButton({ href, children, variant = "secondary", external }: { href: string; children: ReactNode; variant?: Variant; external?: boolean }) {
  const cls = `${base} ${variants[variant]}`;
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}
