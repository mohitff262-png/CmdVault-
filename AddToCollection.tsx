"use client";
import Link from "next/link";
import { FolderPlus } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { addToCollection, removeFromCollection } from "@/lib/storage/collections";

export function AddToCollection({ slug }: { slug: string }) {
  const { state, setState, ready, error } = useCollections();
  return (
    <details className="relative">
      <summary className="inline-flex min-h-[36px] cursor-pointer list-none items-center gap-1.5 rounded-md border border-vault-border bg-vault-raised px-2.5 text-sm hover:border-vault-accent">
        <FolderPlus size={14} aria-hidden /> Add to collection
      </summary>
      <div className="absolute z-10 mt-1 w-64 rounded-md border border-vault-border bg-vault-surface p-2 shadow-lg">
        {!ready ? <p className="p-2 text-sm text-vault-muted">Loading…</p> : state.collections.length === 0 ? (
          <p className="p-2 text-sm text-vault-muted">No collections yet. <Link href="/collections" className="text-vault-accent underline">Create one</Link>.</p>
        ) : (
          <ul>
            {state.collections.map((c) => {
              const inside = c.commandSlugs.includes(slug);
              return (
                <li key={c.id}>
                  <label className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded px-2 hover:bg-vault-raised">
                    <input type="checkbox" checked={inside} onChange={() => setState(inside ? removeFromCollection(state, c.id, slug) : addToCollection(state, c.id, slug))} />
                    <span className="text-sm">{c.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {error ? <p role="alert" className="p-2 text-xs text-vault-danger">{error}</p> : null}
      </div>
    </details>
  );
}
