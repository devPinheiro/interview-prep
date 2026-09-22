"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { getNegotiationDraft, progressKey, saveNegotiationDraft } from "@/lib/progress";

type Props = { question: Question };

export function NegotiationWorksheet({ question }: Props) {
  const key = progressKey(question.track, question.id);
  const fields = question.worksheetFields ?? [
    "Target total cash",
    "Walk-away number",
    "Equity target",
    "Sign-on ask",
    "Competing offer notes",
  ];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    getNegotiationDraft(key).then((d) => {
      if (d) setValues(d.fields);
    });
  }, [key]);

  useEffect(() => {
    const t = setTimeout(() => {
      void saveNegotiationDraft({ key, fields: values, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(t);
  }, [values, key]);

  return (
    <div className="mt-6 space-y-6">
      <div className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-5">
        <h3 className="font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]">
          Total compensation worksheet
        </h3>
        <p className="mt-2 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
          Stored only in this browser. Never synced.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f} className="block text-sm">
              <span className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                {f}
              </span>
              <input
                className="w-full border-b border-[var(--line)] bg-transparent py-2 outline-none transition-colors focus:border-[var(--accent)]"
                value={values[f] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
              />
            </label>
          ))}
        </div>
      </div>

      {question.scripts && question.scripts.length > 0 && (
        <div className="space-y-0">
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]">
            Word tracks
          </h3>
          {question.scripts.map((s) => (
            <article key={s.title} className="border-t border-[var(--line)] py-5">
              <h4 className="font-medium tracking-[-0.01em] text-[var(--ink)]">{s.title}</h4>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                When: {s.when}
              </p>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-[var(--ink)]">
                &ldquo;{s.say}&rdquo;
              </p>
              <p className="mt-3 text-sm text-[var(--danger)]">Avoid: {s.avoid}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
