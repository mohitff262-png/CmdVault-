import type { Tutorial } from "@/lib/content";
import { CommandCodeBlock } from "@/components/commands/CommandCodeBlock";

export function TutorialSteps({ steps }: { steps: Tutorial["steps"] }) {
  return (
    <ol className="grid gap-5">
      {steps.map((s, i) => (
        <li key={s.title} className="grid gap-2">
          <h3 className="font-medium"><span className="mr-2 text-vault-accent">{i + 1}.</span>{s.title}</h3>
          {s.command ? <CommandCodeBlock code={s.command} label="Termux" /> : null}
          <p className="text-sm text-vault-muted">{s.explanation}</p>
        </li>
      ))}
    </ol>
  );
}
