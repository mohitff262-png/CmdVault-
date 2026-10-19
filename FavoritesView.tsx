"use client";
import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { EmptyState } from "@/components/ui/EmptyState";

export interface LiteCommand { slug: string; name: string; description: string; syntax: string; category: string }

export function FavoritesView({ commands }: { commands: LiteCommand[] }) {
  const { favorites, toggle, ready, error } = useFavorites();
  const [q, setQ] = useState("");
  if (!ready) return <p className="text-vault-muted" role="status">Loading your favorites…</p>;
  const items = commands.filter((c) => favorites.includes(c.slug) && `${c.name} ${c.description} ${c.syntax}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-4">
      {error ? <p role="alert" className="text-sm text-vault-danger">{error}</p> : null}
      {favorites.length === 0 ? <EmptyState title="No favorites yet">Open a command and press Favorite. <Link href="/commands" className="text-vault-accent underline">Browse commands</Link>.</EmptyState> : (
        <>
          <label className="grid gap-1 text-sm">Search favorites<input value={q} onChange={(e) => setQ(e.target.value)} className="h-11 rounded-md border border-vault-border bg-vault-surface px-3" /></label>
          {items.length === 0 ? <EmptyState title="No favorites match that search" /> : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((c) => (
                <li key={c.slug} className="rounded-lg border border-vault-border bg-vault-surface p-4">
                  <Link href={`/commands/${c.slug}`} className="font-medium hover:text-vault-accent">{c.name}</Link>
                  <p className="mt-1 text-sm text-vault-muted">{c.description}</p>
                  <button type="button" onClick={() => toggle(c.slug)} className="mt-3 min-h-[36px] text-sm text-vault-danger underline">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
