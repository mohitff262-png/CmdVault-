"use client";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

/** A plain GET form, so search works without JavaScript. "/" focuses the field. */
export function SearchBox({ defaultValue = "", large = false, action = "/commands" }: { defaultValue?: string; large?: boolean; action?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (e.key === "/" && !typing) { e.preventDefault(); ref.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <form action={action} method="get" role="search" className="relative">
      <label htmlFor="q" className="sr-only">Search commands</label>
      <Search size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vault-muted" />
      <input ref={ref} id="q" name="q" type="search" defaultValue={defaultValue} autoComplete="off" placeholder="Search commands, errors, tools…"
        className={`w-full rounded-lg border border-vault-border bg-vault-surface pl-10 pr-16 text-vault-text placeholder:text-vault-muted focus:border-vault-accent ${large ? "h-14 text-base" : "h-11 text-sm"}`} />
      <kbd aria-hidden className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-vault-border px-1.5 text-xs text-vault-muted sm:block">/</kbd>
    </form>
  );
}
