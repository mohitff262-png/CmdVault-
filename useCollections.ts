"use client";
import { COLLECTIONS_KEY, emptyCollections, parseCollections, type CollectionsState } from "@/lib/storage/collections";
import { useStore } from "./useStore";

const initial: CollectionsState = emptyCollections();

export function useCollections() {
  const { value, update, ready, error } = useStore(COLLECTIONS_KEY, parseCollections, initial);
  return { state: value, setState: update, ready, error };
}
