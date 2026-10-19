"use client";
import { FAVORITES_KEY, parseFavorites, toggleFavorite } from "@/lib/storage/favorites";
import { useStore } from "./useStore";

const initial: string[] = [];

export function useFavorites() {
  const { value, update, ready, error } = useStore(FAVORITES_KEY, parseFavorites, initial);
  return { favorites: value, ready, error, isFavorite: (slug: string) => value.includes(slug), toggle: (slug: string) => update(toggleFavorite(value, slug)) };
}
