import { Fragment } from "react";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps matching terms in <mark>. Pure text nodes only; no HTML injection. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const valid = terms.filter(Boolean);
  if (valid.length === 0) return <>{text}</>;
  const re = new RegExp(`(${valid.map(esc).join("|")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{i % 2 === 1 ? <mark>{p}</mark> : p}</Fragment>
      ))}
    </>
  );
}
