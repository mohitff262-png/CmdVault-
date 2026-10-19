"use client";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({ slug }: { slug: string }) {
  const { isFavorite, toggle, ready, error } = useFavorites();
  const fav = ready && isFavorite(slug);
  return (
    <span className="inline-flex flex-col">
      <button type="button" aria-pressed={fav} onClick={() => toggle(slug)} disabled={!ready}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-vault-border bg-vault-raised px-2.5 text-sm hover:border-vault-accent disabled:opacity-60">
        <Star size={14} aria-hidden className={fav ? "fill-vault-warn text-vault-warn" : ""} />
        {fav ? "Favorited" : "Favorite"}
      </button>
      {error ? <span role="alert" className="mt-1 text-xs text-vault-danger">{error}</span> : null}
    </span>
  );
}
