"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto grid max-w-lg gap-4 py-16 text-center" role="alert">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-vault-muted">An unexpected error occurred. You can try again or return to the home page.</p>
      <div className="flex justify-center gap-2"><Button variant="primary" onClick={reset}>Try again</Button><a href="/" className="inline-flex min-h-[40px] items-center rounded-md border border-vault-border px-3.5 text-sm">Home</a></div>
    </div>
  );
}
