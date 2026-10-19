import Link from "next/link";
import { Terminal } from "lucide-react";
import { NAV } from "./nav";
import { MobileNavigation } from "./MobileNavigation";

export function Header() {
  return (
    <header className="relative sticky top-0 z-30 border-b border-vault-border bg-vault-bg/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="CmdVault home">
          <Terminal size={20} className="text-vault-accent" aria-hidden />
          <span>CmdVault</span>
        </Link>
        <nav aria-label="Main" className="hidden gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm text-vault-muted hover:text-vault-text">{n.label}</Link>
          ))}
        </nav>
        <MobileNavigation />
      </div>
    </header>
  );
}
