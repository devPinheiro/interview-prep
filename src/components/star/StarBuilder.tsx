"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { getStarDraft, progressKey, saveStarDraft } from "@/lib/progress";
import { Button } from "@/components/ui/Button";

const FIELDS = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
  { key: "reflection", label: "Reflection" },
] as const;

type Props = { question: Question };

export function StarBuilder({ question }: Props) {
  const key = progressKey(question.track, question.id);
  const [draft, setDraft] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
    reflection: "",
  });
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    getStarDraft(key).then((d) => {
      if (d) {
        setDraft({
          situation: d.situation,
          task: d.task,
          action: d.action,
          result: d.result,
          reflection: d.reflection,
        });
      }
    });
  }, [key]);

  useEffect(() => {
    const t = setTimeout(() => {
      void saveStarDraft({ key, ...draft, updatedAt: Date.now() });
    }, 400);
    return () => clearTimeout(t);
  }, [draft, key]);

  return (
    <div className="mt-6 space-y-4">
      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {f.label}
          </span>
          <textarea
            className="w-full border border-[var(--line)] bg-[var(--bg-elevated)] p-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
            rows={f.key === "action" ? 4 : 2}
            value={draft[f.key]}
            onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
            placeholder={`Write your ${f.label.toLowerCase()}…`}
          />
        </label>
      ))}

      {question.starModel && (
        <div>
          <Button size="sm" variant="line" onClick={() => setShowModel((s) => !s)}>
            {showModel ? "Hide model answer" : "Compare to model STAR(R)"}
          </Button>
          {showModel && (
            <div className="animate-reveal mt-3 space-y-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--muted)]">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <div className="text-xs font-semibold uppercase text-[var(--accent)]">{f.label}</div>
                  <p className="mt-1">{question.starModel![f.key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
