import Link from "next/link";
import { REPO_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-vault-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-vault-muted">
        <p>CmdVault is open source. Always read a command before running it.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-vault-text">About</Link>
          <Link href="/contribute" className="hover:text-vault-text">Contribute</Link>
          <Link href="/privacy" className="hover:text-vault-text">Privacy</Link>
          <Link href="/terms" className="hover:text-vault-text">Terms</Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-vault-text">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
