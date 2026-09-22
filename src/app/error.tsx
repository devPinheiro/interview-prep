"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-5 py-20 text-center">
      <p className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--danger)]">
        Something went wrong
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[-0.02em]">
        Page error
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted)]">
        Try again. If this keeps happening, refresh or return home.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button variant="line" onClick={() => (window.location.href = "/")}>
          Home
        </Button>
      </div>
    </div>
  );
}
