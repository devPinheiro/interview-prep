"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { getRadioDraft, progressKey, saveRadioDraft } from "@/lib/progress";
import { cn } from "@/lib/cn";

const STEPS = [
  { key: "requirements", label: "R — Requirements" },
  { key: "architecture", label: "A — Architecture" },
  { key: "data", label: "D — Data model" },
  { key: "interface", label: "I — Interface & perf" },
  { key: "observability", label: "O — Observability" },
] as const;

type Props = { question: Question };

export function RadioWizard({ question }: Props) {
  const steps = question.radioSteps;
  const key = progressKey(question.track, question.id);
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getRadioDraft(key).then((d) => {
      if (d) {
        setChecked(d.checked);
        setNotes(d.notes);
      }
    });
  }, [key]);

  useEffect(() => {
    const t = setTimeout(() => {
      void saveRadioDraft({ key, checked, notes, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(t);
  }, [checked, notes, key]);

  if (!steps) return null;

  const step = STEPS[active];
  const items = steps[step.key];

  return (
    <div className="mt-8 border border-[var(--line)] bg-[var(--bg-elevated)]/70">
      <div className="flex flex-wrap gap-x-1 gap-y-1 border-b border-[var(--line)] px-2 py-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.7rem] tracking-wide transition-colors",
              i === active
                ? "bg-[var(--ink)] text-[var(--bg-elevated)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        <p className="mb-4 text-sm text-[var(--muted)]">
          Check off talking points as you cover them in your design.
        </p>
        <ul className="space-y-3">
          {items.map((item) => {
            const id = `${step.key}:${item}`;
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    className="mt-1 accent-[var(--accent)]"
                    checked={!!checked[id]}
                    onChange={(e) =>
                      setChecked((c) => ({ ...c, [id]: e.target.checked }))
                    }
                  />
                  <span>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <textarea
          className="mt-5 w-full border border-[var(--line)] bg-[var(--bg)] p-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          rows={4}
          placeholder="Your sketch notes for this step…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
