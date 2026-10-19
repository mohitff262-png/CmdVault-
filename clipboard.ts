export type CopyResult = { ok: true } | { ok: false; error: string };

/** Uses the Clipboard API, falls back to execCommand. Only reports success when a method succeeded. */
export async function copyText(text: string): Promise<CopyResult> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    }
  } catch {
    /* fall through to the legacy method */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const done = document.execCommand("copy");
    document.body.removeChild(ta);
    return done ? { ok: true } : { ok: false, error: "Copy was blocked by the browser. Select the text and copy it manually." };
  } catch {
    return { ok: false, error: "Copy is not supported here. Select the text and copy it manually." };
  }
}
