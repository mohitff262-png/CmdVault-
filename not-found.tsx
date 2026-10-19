import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-lg gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-vault-muted">That page or command does not exist. Try searching, or <Link href="/categories" className="text-vault-accent underline">browse categories</Link>.</p>
      <SearchBox />
    </div>
  );
}
