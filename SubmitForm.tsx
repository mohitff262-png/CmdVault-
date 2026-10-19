"use client";
import { useMemo, useState } from "react";
import { CATEGORY_SLUGS, DIFFICULTIES, PLATFORMS, RISKS } from "@/lib/commands/schema";
import { submissionSchema, toContributionTemplate } from "@/lib/validation/submission";
import { CopyButton } from "@/components/commands/CopyButton";
import { Button } from "@/components/ui/Button";

const empty = { name: "", description: "", explanation: "", category: "git", syntax: "", exampleCommand: "", exampleDescription: "", platforms: ["linux"] as string[], difficulty: "beginner", risk: "safe", source: "", contributor: "", website: "" };

export function SubmitForm() {
  const [f, setF] = useState(empty);
  const [showErrors, setShowErrors] = useState(false);
  const parsed = useMemo(() => submissionSchema.safeParse({ ...f, sources: f.source ? [f.source] : [], contributor: f.contributor || undefined }), [f]);
  const json = useMemo(() => (parsed.success ? JSON.stringify(toContributionTemplate(parsed.data, new Date().toISOString().slice(0, 10)), null, 2) : ""), [parsed]);
  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }));
  const err = (path: string) => (showErrors && !parsed.success ? parsed.error.issues.find((i) => i.path[0] === path)?.message : undefined);

  const field = (k: keyof typeof empty, label: string, opts: { area?: boolean; mono?: boolean; path?: string } = {}) => (
    <div className="grid gap-1">
      <label htmlFor={`s-${k}`} className="text-sm">{label}</label>
      {opts.area ? <textarea id={`s-${k}`} rows={3} value={f[k] as string} onChange={(e) => set(k, e.target.value)} className="rounded-md border border-vault-border bg-vault-surface p-2 text-sm" />
        : <input id={`s-${k}`} value={f[k] as string} onChange={(e) => set(k, e.target.value)} className={`h-11 rounded-md border border-vault-border bg-vault-surface px-3 text-sm ${opts.mono ? "font-mono" : ""}`} />}
      {err(opts.path ?? k) ? <p role="alert" className="text-xs text-vault-danger">{err(opts.path ?? k)}</p> : null}
    </div>
  );
  const select = (k: keyof typeof empty, label: string, options: readonly string[]) => (
    <div className="grid gap-1">
      <label htmlFor={`s-${k}`} className="text-sm">{label}</label>
      <select id={`s-${k}`} value={f[k] as string} onChange={(e) => set(k, e.target.value)} className="h-11 rounded-md border border-vault-border bg-vault-surface px-2 text-sm">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  function download() {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "cmdvault-contribution.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={(e) => { e.preventDefault(); setShowErrors(true); }} className="grid gap-4" noValidate>
        {field("name", "Command name")}
        {field("description", "Short description")}
        {field("syntax", "Syntax", { mono: true })}
        {field("exampleCommand", "Example command", { mono: true })}
        {field("exampleDescription", "What the example does")}
        {field("explanation", "Detailed explanation", { area: true })}
        <div className="grid grid-cols-2 gap-3">{select("category", "Category", CATEGORY_SLUGS)}{select("difficulty", "Difficulty", DIFFICULTIES)}{select("risk", "Risk", RISKS)}</div>
        <fieldset className="grid gap-1">
          <legend className="text-sm">Platforms</legend>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <label key={p} className="flex min-h-[40px] items-center gap-2 text-sm">
                <input type="checkbox" checked={f.platforms.includes(p)} onChange={() => setF((s) => ({ ...s, platforms: s.platforms.includes(p) ? s.platforms.filter((x) => x !== p) : [...s.platforms, p] }))} /> {p}
              </label>
            ))}
          </div>
          {err("platforms") ? <p role="alert" className="text-xs text-vault-danger">{err("platforms")}</p> : null}
        </fieldset>
        {field("source", "Official documentation URL (https)", { path: "sources" })}
        {field("contributor", "Your name or GitHub handle (optional)")}
        <div aria-hidden className="hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></label></div>
        <Button type="submit" variant="primary" className="w-fit">Validate and preview</Button>
      </form>
      <div className="grid content-start gap-3" aria-live="polite">
        <h2 className="font-medium">Preview</h2>
        {showErrors && !parsed.success ? <p role="alert" className="rounded-lg border border-vault-danger/50 bg-vault-danger/10 p-3 text-sm">Fix the highlighted fields to generate the contribution.</p> : null}
        {json ? (
          <>
            <pre className="max-h-96 overflow-auto rounded-lg border border-vault-border bg-vault-surface p-3 font-mono text-xs" tabIndex={0}>{json}</pre>
            <div className="flex flex-wrap gap-2"><CopyButton text={json} label="Copy JSON" /><Button onClick={download}>Download JSON</Button></div>
            <p className="text-sm text-vault-muted">This is not submitted anywhere and is not published. Add it to the matching file in <code>src/data/commands/</code> and open a pull request.</p>
          </>
        ) : <p className="text-sm text-vault-muted">The JSON appears here once all fields are valid.</p>}
      </div>
    </div>
  );
}
