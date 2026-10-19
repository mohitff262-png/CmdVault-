"use client";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { defaultValues, getBuilder, type Values } from "@/lib/builders";
import { CommandCodeBlock } from "@/components/commands/CommandCodeBlock";
import { Button } from "@/components/ui/Button";

export function BuilderShell({ slug }: { slug: string }) {
  const def = getBuilder(slug);
  const [values, setValues] = useState<Values>(() => (def ? defaultValues(def) : {}));
  const result = useMemo(() => (def ? def.build(values) : null), [def, values]);
  if (!def || !result) return <p role="alert">Unknown builder.</p>;

  const touched = def.fields.some((f) => values[f.key] !== (f.default ?? (f.type === "checkbox" ? false : "")));
  const set = (k: string, v: string | boolean) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={(e) => e.preventDefault()} className="grid content-start gap-4" aria-label={`${def.title} options`}>
        {def.fields.map((f) => (
          <div key={f.key} className="grid gap-1">
            {f.type === "checkbox" ? (
              <label className="flex min-h-[40px] items-center gap-2 text-sm">
                <input type="checkbox" checked={values[f.key] === true} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}
              </label>
            ) : (
              <>
                <label htmlFor={`f-${f.key}`} className="text-sm">{f.label}{f.required ? <span aria-hidden className="text-vault-danger"> *</span> : null}</label>
                {f.type === "select" ? (
                  <select id={`f-${f.key}`} value={String(values[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} className="h-11 rounded-md border border-vault-border bg-vault-surface px-2">
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={`f-${f.key}`} type={f.type === "number" ? "number" : "text"} inputMode={f.type === "number" ? "numeric" : undefined} value={String(values[f.key] ?? "")}
                    onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} autoComplete="off" spellCheck={false}
                    className="h-11 rounded-md border border-vault-border bg-vault-surface px-3 font-mono text-sm placeholder:text-vault-muted" />
                )}
              </>
            )}
            {f.help ? <p className="text-xs text-vault-muted">{f.help}</p> : null}
          </div>
        ))}
        <Button onClick={() => setValues(defaultValues(def))} disabled={!touched} className="w-fit"><RotateCcw size={14} aria-hidden /> Reset</Button>
      </form>

      <div className="grid content-start gap-4" aria-live="polite">
        {result.errors.length > 0 ? (
          <ul role="alert" className="grid gap-1 rounded-lg border border-vault-danger/50 bg-vault-danger/10 p-3 text-sm">
            {result.errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        ) : result.command ? (
          <CommandCodeBlock code={result.command} label="Preview (not executed)" />
        ) : (
          <p className="rounded-lg border border-dashed border-vault-border p-4 text-sm text-vault-muted">Fill in the form to see the command.</p>
        )}
        {result.warnings.map((w) => <p key={w} role="note" className="rounded-lg border border-vault-warn/40 bg-vault-warn/10 p-3 text-sm">{w}</p>)}
        {result.explanations.length > 0 ? (
          <div>
            <h3 className="mb-1 text-sm font-medium">What the options do</h3>
            <ul className="list-disc pl-5 text-sm text-vault-muted">{result.explanations.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        ) : null}
        <p className="text-xs text-vault-muted">Platforms: {def.platforms.join(", ")}. CmdVault never runs commands for you.</p>
      </div>
    </div>
  );
}
