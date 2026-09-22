"use client";

import { useEffect, useState } from "react";
import type { Level } from "@/lib/types";
import { LEVELS, LEVEL_LABELS } from "@/lib/types";
import { getMeta, setMeta } from "@/lib/progress";
import { cn } from "@/lib/cn";

export function LevelPicker() {
  const [level, setLevel] = useState<Level | "all">("all");

  useEffect(() => {
    getMeta().then((m) => setLevel(m.preferredLevel));
  }, []);

  async function pick(next: Level | "all") {
    setLevel(next);
    await setMeta({ preferredLevel: next });
  }

  const options: (Level | "all")[] = ["all", ...LEVELS];

  return (
    <div>
      <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
        Target level
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((l) => {
          const active = level === l;
          const label = l === "all" ? "All" : LEVEL_LABELS[l];
          return (
            <button
              key={l}
              type="button"
              onClick={() => pick(l)}
              data-active={active}
              className={cn(
                "underline-draw pb-0.5 text-sm transition-colors",
                active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
