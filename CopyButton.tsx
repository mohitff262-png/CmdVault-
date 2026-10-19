"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { copyText } from "@/lib/utils/clipboard";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(t);
  }, [state]);

  async function onCopy() {
    const r = await copyText(text);
    if (r.ok) { setState("copied"); setMessage("Copied to clipboard"); }
    else { setState("failed"); setMessage(r.error); }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={onCopy} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-vault-border bg-vault-raised px-2.5 text-sm hover:border-vault-accent">
        {state === "copied" ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        {state === "copied" ? "Copied" : label}
      </button>
      <span role="status" aria-live="polite" className={`text-xs ${state === "failed" ? "text-vault-danger" : "text-vault-ok"}`}>{state === "idle" ? "" : message}</span>
    </span>
  );
}
