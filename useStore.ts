"use client";
import { useCallback, useEffect, useState } from "react";
import { safeGet, safeSet } from "@/lib/storage/safe-storage";

const EVT = "cmdvault:storage";

/** localStorage-backed state: SSR-safe, validated by `parse`, synced across components and tabs. */
export function useStore<T>(key: string, parse: (raw: string | null) => T, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setValue(parse(safeGet(key)));
    load();
    setReady(true);
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
  }, [key, parse]);

  const update = useCallback(
    (next: T) => {
      const saved = safeSet(key, JSON.stringify(next));
      setError(saved ? null : "Could not save: browser storage is unavailable or full. Changes will be lost on reload.");
      setValue(next);
      window.dispatchEvent(new Event(EVT));
    },
    [key],
  );

  return { value, update, ready, error };
}
