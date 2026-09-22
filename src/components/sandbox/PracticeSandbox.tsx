"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { SandboxConfig } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { SandboxErrorBoundary } from "@/components/SandboxErrorBoundary";

const SandpackInner = dynamic(() => import("./SandpackInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center border border-[var(--line)] text-sm text-[var(--muted)]">
      Loading workspace…
    </div>
  ),
});

type Props = {
  config: SandboxConfig;
  onPass?: (passed: boolean) => void;
};

export function PracticeSandbox({ config, onPass }: Props) {
  const [resetKey, setResetKey] = useState(0);

  const files = useMemo(() => {
    const map: Record<string, { code: string; hidden?: boolean; active?: boolean }> = {};
    for (const f of config.files) {
      map[f.path.startsWith("/") ? f.path : `/${f.path}`] = {
        code: f.code,
        hidden: f.hidden,
        active: f.active,
      };
    }
    return map;
  }, [config.files]);

  return (
    <div className="overflow-hidden border border-[var(--line)] bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--muted)]">
          Workspace
        </span>
        <Button size="sm" variant="ghost" onClick={() => setResetKey((k) => k + 1)}>
          Reset
        </Button>
      </div>
      <SandboxErrorBoundary onReset={() => setResetKey((k) => k + 1)}>
        <SandpackInner
          key={resetKey}
          template={config.template ?? "vanilla-ts"}
          files={files}
          dependencies={config.dependencies}
          onPass={onPass}
        />
      </SandboxErrorBoundary>
    </div>
  );
}
