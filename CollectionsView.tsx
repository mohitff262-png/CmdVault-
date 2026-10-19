"use client";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { useCollections } from "@/hooks/useCollections";
import { createCollection, deleteCollection, newId, removeFromCollection, renameCollection } from "@/lib/storage/collections";
import { exportCollections, importCollections, mergeCollections } from "@/lib/storage/import-export";
import { CopyButton } from "@/components/commands/CopyButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LiteCommand } from "./FavoritesView";

export function CollectionsView({ commands }: { commands: LiteCommand[] }) {
  const { state, setState, ready, error } = useCollections();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [q, setQ] = useState("");
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  if (!ready) return <p className="text-vault-muted" role="status">Loading your collections…</p>;
  const bySlug = new Map(commands.map((c) => [c.slug, c]));
  const json = exportCollections(state);

  function download() {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url; a.download = "cmdvault-collections.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const r = importCollections(await file.text());
      if (!r.ok) { setNotice({ kind: "error", text: r.error }); return; }
      setState(mergeCollections(state, r.data));
      setNotice({ kind: "ok", text: `Imported ${r.data.collections.length} collection(s).` });
    } catch {
      setNotice({ kind: "error", text: "Could not read that file." });
    }
  }

  return (
    <div className="grid gap-6">
      <p className="rounded-lg border border-vault-border bg-vault-surface p-3 text-sm text-vault-muted">Collections are stored in this browser only (localStorage). They are not synced between devices. Export a backup to move them.</p>
      {error ? <p role="alert" className="text-sm text-vault-danger">{error}</p> : null}
      {notice ? <p role={notice.kind === "error" ? "alert" : "status"} className={`text-sm ${notice.kind === "error" ? "text-vault-danger" : "text-vault-ok"}`}>{notice.text}</p> : null}

      <form onSubmit={(e) => { e.preventDefault(); setState(createCollection(state, name, newId(), new Date().toISOString())); setName(""); }} className="flex flex-wrap gap-2">
        <label htmlFor="new-collection" className="sr-only">Collection name</label>
        <input id="new-collection" value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name" maxLength={80} className="h-11 min-w-0 flex-1 rounded-md border border-vault-border bg-vault-surface px-3" />
        <Button type="submit" variant="primary" disabled={!name.trim()}>Create</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={download} disabled={state.collections.length === 0}>Export JSON</Button>
        <CopyButton text={json} label="Copy export" />
        <label className="inline-flex min-h-[40px] cursor-pointer items-center rounded-md border border-vault-border bg-vault-raised px-3.5 text-sm hover:border-vault-accent">
          Import JSON<input type="file" accept="application/json,.json" onChange={onImport} className="sr-only" />
        </label>
        <label className="ml-auto grid text-xs text-vault-muted">Search saved commands
          <input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 rounded-md border border-vault-border bg-vault-surface px-3 text-sm text-vault-text" /></label>
      </div>

      {state.collections.length === 0 ? <EmptyState title="No collections yet">Create one above, then add commands from any command page.</EmptyState> : (
        <ul className="grid gap-4">
          {state.collections.map((c) => {
            const items = c.commandSlugs.map((s) => bySlug.get(s)).filter((x): x is LiteCommand => Boolean(x)).filter((x) => `${x.name} ${x.description}`.toLowerCase().includes(q.toLowerCase()));
            return (
              <li key={c.id} className="rounded-lg border border-vault-border bg-vault-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {editing?.id === c.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); setState(renameCollection(state, c.id, editing.value)); setEditing(null); }} className="flex gap-2">
                      <label className="sr-only" htmlFor={`rename-${c.id}`}>Rename collection</label>
                      <input id={`rename-${c.id}`} autoFocus value={editing.value} onChange={(e) => setEditing({ id: c.id, value: e.target.value })} className="h-10 rounded-md border border-vault-border bg-vault-bg px-2" />
                      <Button type="submit" variant="primary">Save</Button><Button onClick={() => setEditing(null)}>Cancel</Button>
                    </form>
                  ) : <h2 className="font-medium">{c.name} <span className="text-sm text-vault-muted">({c.commandSlugs.length})</span></h2>}
                  <div className="flex gap-2">
                    <Button onClick={() => setEditing({ id: c.id, value: c.name })}>Rename</Button>
                    <Button variant="danger" onClick={() => { if (window.confirm(`Delete "${c.name}"? This cannot be undone.`)) setState(deleteCollection(state, c.id)); }}>Delete</Button>
                  </div>
                </div>
                {items.length === 0 ? <p className="mt-3 text-sm text-vault-muted">{c.commandSlugs.length === 0 ? "Empty. Add commands from their detail pages." : "No saved commands match your search."}</p> : (
                  <ul className="mt-3 divide-y divide-vault-border">
                    {items.map((cmd) => (
                      <li key={cmd.slug} className="flex items-center justify-between gap-3 py-2">
                        <Link href={`/commands/${cmd.slug}`} className="text-sm hover:text-vault-accent">{cmd.name}</Link>
                        <button type="button" className="min-h-[36px] text-sm text-vault-danger underline" onClick={() => setState(removeFromCollection(state, c.id, cmd.slug))}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
