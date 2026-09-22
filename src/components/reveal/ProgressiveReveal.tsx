"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Question } from "@/lib/types";
import { upsertProgress, type RevealLevel } from "@/lib/progress";
import { cn } from "@/lib/cn";

const ORDER: RevealLevel[] = ["none", "hint", "approach", "solution"];

function Markdownish({ text }: { text: string }) {
  return (
    <div className="prose-study whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
      {text}
    </div>
  );
}

type Props = {
  question: Question;
  initialReveal?: RevealLevel;
  onRevealChange?: (level: RevealLevel) => void;
  gated?: boolean;
  gatePassed?: boolean;
  nextHref?: string;
};

export function ProgressiveReveal({
  question,
  initialReveal = "none",
  onRevealChange,
  gated = false,
  gatePassed = true,
  nextHref,
}: Props) {
  const [reveal, setReveal] = useState<RevealLevel>(initialReveal);
  const [force, setForce] = useState(false);

  const setLevel = useCallback(
    async (level: RevealLevel) => {
      if (gated && !gatePassed && !force && level !== "none" && level !== "hint") {
        return;
      }
      setReveal(level);
      onRevealChange?.(level);
      await upsertProgress({
        track: question.track,
        id: question.id,
        reveal: level,
        completed: level === "solution",
      });
    },
    [force, gatePassed, gated, onRevealChange, question.id, question.track],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.key === "h" || e.key === "H") setLevel("hint");
      if (e.key === "a" || e.key === "A") setLevel("approach");
      if (e.key === "s" || e.key === "S") setLevel("solution");
      if ((e.key === "n" || e.key === "N") && nextHref) {
        window.location.href = nextHref;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLevel, nextHref]);

  const idx = ORDER.indexOf(reveal);
  const blocked = gated && !gatePassed && !force;

  const steps = [
    { key: "hint" as const, label: "01 Hint", short: "H" },
    { key: "approach" as const, label: "02 Approach", short: "A" },
    { key: "solution" as const, label: "03 Solution", short: "S" },
  ];

  return (
    <section className="animate-fade-up mt-12 border-t border-[var(--line)] pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.02em] text-[var(--ink)]">
          Answer ladder
        </h2>
        <p className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
          H · A · S{nextHref ? " · N next" : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--line)] pb-4">
        {steps.map((step) => {
          const active = reveal === step.key;
          const isLocked = blocked && step.key !== "hint";
          return (
            <button
              key={step.key}
              type="button"
              disabled={isLocked}
              onClick={() => setLevel(step.key)}
              data-active={active}
              className={cn(
                "underline-draw pb-1 font-[family-name:var(--font-mono)] text-[0.75rem] tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                active ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
              )}
            >
              {step.label}
            </button>
          );
        })}
        {blocked && (
          <Button size="sm" variant="ghost" onClick={() => setForce(true)}>
            Override gate
          </Button>
        )}
      </div>

      {blocked && reveal === "none" && (
        <p className="mb-4 text-sm text-[var(--muted)]">Run tests first, or override to peek.</p>
      )}

      {idx >= 1 && (
        <div className="animate-reveal mb-5 border-l-2 border-[var(--accent)] bg-[var(--bg-elevated)]/80 py-4 pl-5 pr-4">
          <h3 className="mb-2 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--accent)]">
            Hint
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted)]">
            {question.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {idx >= 2 && (
        <div className="animate-reveal mb-5 border-l-2 border-[var(--accent)] bg-[var(--bg-elevated)]/80 py-4 pl-5 pr-4">
          <h3 className="mb-2 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--accent)]">
            Approach
          </h3>
          <Markdownish text={question.approach} />
        </div>
      )}

      {idx >= 3 && (
        <div className="animate-reveal mb-5 border-l-2 border-[var(--ink)] bg-[var(--bg-elevated)]/80 py-4 pl-5 pr-4">
          <h3 className="mb-2 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ink)]">
            Solution
          </h3>
          <Markdownish text={question.solution} />
          {question.interviewerNotes && (
            <>
              <h3 className="mb-2 mt-6 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.16em] text-[var(--warn)]">
                What interviewers listen for
              </h3>
              <Markdownish text={question.interviewerNotes} />
            </>
          )}
        </div>
      )}

      {question.sourceRefs.length > 0 && (
        <div className="mt-6 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
          <span className="mr-3">Study deeper</span>
          {question.sourceRefs.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="mr-4 underline-draw hover:text-[var(--accent)]"
            >
              {s.site}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
