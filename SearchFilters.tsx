import Link from "next/link";
import { CATEGORY_SLUGS, DIFFICULTIES, PLATFORMS, RISKS } from "@/lib/commands/schema";
import type { SearchQuery } from "@/lib/validation/api";

function Sel({ name, label, options, value }: { name: string; label: string; options: readonly string[]; value?: string }) {
  return (
    <label className="grid gap-1 text-xs text-vault-muted">
      {label}
      <select name={name} defaultValue={value ?? ""} className="h-10 rounded-md border border-vault-border bg-vault-surface px-2 text-sm text-vault-text">
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/** GET form: submitting reloads the page with the filters in the URL (shareable). */
export function SearchFilters({ query }: { query: SearchQuery }) {
  return (
    <form action="/commands" method="get" className="grid grid-cols-2 gap-3 rounded-lg border border-vault-border bg-vault-surface p-3 md:grid-cols-6" aria-label="Filters">
      <input type="hidden" name="q" value={query.q ?? ""} />
      <Sel name="platform" label="Platform" options={PLATFORMS} value={query.platform} />
      <Sel name="category" label="Category" options={CATEGORY_SLUGS} value={query.category} />
      <Sel name="difficulty" label="Difficulty" options={DIFFICULTIES} value={query.difficulty} />
      <Sel name="risk" label="Risk" options={RISKS} value={query.risk} />
      <Sel name="sort" label="Sort" options={["relevance", "name", "recent"]} value={query.sort} />
      <div className="flex items-end gap-2">
        <button type="submit" className="h-10 flex-1 rounded-md bg-vault-accentStrong px-3 text-sm font-medium text-white hover:bg-vault-accent">Apply</button>
        <Link href={query.q ? `/commands?q=${encodeURIComponent(query.q)}` : "/commands"} className="inline-flex h-10 items-center rounded-md border border-vault-border px-3 text-sm">Clear</Link>
      </div>
    </form>
  );
}
