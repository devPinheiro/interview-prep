import { cn } from "@/lib/cn";
import type { ContentStatus, Level } from "@/lib/types";
import { LEVEL_LABELS } from "@/lib/types";

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
      {LEVEL_LABELS[level]}
    </span>
  );
}

export function StatusDot({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-[1px]",
        status === "ready" && "bg-[var(--accent)]",
        status === "drafted" && "bg-[var(--warn)]",
        status === "stub" && "bg-[var(--line)]",
      )}
      title={status}
    />
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[family-name:var(--font-mono)] text-[0.65rem] tracking-wide text-[var(--muted)]">
      #{children}
    </span>
  );
}
