import Link from "next/link";
import type { Tutorial } from "@/lib/content";

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <li><Link href={`/termux/${tutorial.slug}`} className="block h-full rounded-lg border border-vault-border bg-vault-surface p-4 hover:border-vault-accent">
      <h3 className="font-medium">{tutorial.title}</h3><p className="mt-1 text-sm text-vault-muted">{tutorial.summary}</p></Link></li>
  );
}
