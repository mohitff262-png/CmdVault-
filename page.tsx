import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CommandCodeBlock } from "@/components/commands/CommandCodeBlock";
import { CommandList } from "@/components/commands/CommandList";
import { Badge } from "@/components/ui/Badge";
import { getCommandBySlug } from "@/lib/commands/repository";
import { getTroubleshooting, getTroubleshootingArticle } from "@/lib/content";
import type { Command } from "@/lib/commands/schema";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => getTroubleshooting().map((t) => ({ slug: t.slug }));
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTroubleshootingArticle((await params).slug);
  return { title: t ? t.title : "Article not found" };
}

export default async function TroubleshootingArticlePage({ params }: Props) {
  const t = getTroubleshootingArticle((await params).slug);
  if (!t) notFound();
  const related = t.relatedCommands.map(getCommandBySlug).filter((c): c is Command => Boolean(c));
  return (
    <article className="grid gap-6">
      <div><Breadcrumbs items={[{ label: "Troubleshooting", href: "/troubleshooting" }, { label: t.title }]} /><h1 className="text-2xl font-semibold">{t.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">{t.platforms.map((p) => <Badge key={p}>{p}</Badge>)}</div></div>
      <CommandCodeBlock code={t.errorText} label="Error message" />
      <section><h2 className="font-medium">Likely causes</h2><ul className="mt-1 list-disc pl-5 text-sm text-vault-muted">{t.causes.map((c) => <li key={c}>{c}</li>)}</ul></section>
      <section><h2 className="mb-3 font-medium">Steps</h2><ol className="grid gap-4">{t.steps.map((s, i) => <li key={s.text} className="grid gap-2"><p className="text-sm"><span className="mr-2 text-vault-accent">{i + 1}.</span>{s.text}</p>{s.command ? <CommandCodeBlock code={s.command} /> : null}</li>)}</ol></section>
      {related.length ? <section><h2 className="mb-2 font-medium">Related commands</h2><CommandList commands={related} /></section> : null}
    </article>
  );
}
