"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { ProgressiveReveal } from "@/components/reveal/ProgressiveReveal";
import { PracticeSandbox } from "@/components/sandbox/PracticeSandbox";
import { SystemDesignArticle } from "@/components/system-design/SystemDesignArticle";
import { StarBuilder } from "@/components/star/StarBuilder";
import { NegotiationWorksheet } from "@/components/negotiation/NegotiationWorksheet";
import { LevelBadge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getProgress, setMeta, upsertProgress, type RevealLevel } from "@/lib/progress";
import { schedule, type Rating } from "@/lib/fsrs";

type Props = { question: Question; nextHref?: string };

export function QuestionView({ question, nextHref }: Props) {
  const [gatePassed, setGatePassed] = useState(!question.sandbox);
  const [reveal, setReveal] = useState<RevealLevel>("none");
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void setMeta({ lastTrack: question.track, lastQuestionKey: `${question.track}:${question.id}` });
    getProgress(question.track, question.id).then((p) => {
      if (p?.reveal) setReveal(p.reveal);
    });
    void upsertProgress({ track: question.track, id: question.id, attempts: 1 });
  }, [question.id, question.track]);

  const correctId = useMemo(
    () => question.options?.find((o) => o.correct)?.id ?? null,
    [question.options],
  );

  async function rate(rating: Rating) {
    const existing = await getProgress(question.track, question.id);
    const card = schedule(
      {
        due: existing?.due ?? Date.now(),
        stability: existing?.stability ?? 0,
        difficulty: existing?.difficulty ?? 5,
        reps: existing?.reps ?? 0,
        lapses: existing?.lapses ?? 0,
      },
      rating,
    );
    await upsertProgress({
      track: question.track,
      id: question.id,
      ...card,
      completed: rating >= 3,
    });
  }

  if (question.track === "system-design" && question.systemDesignGuide) {
    return (
      <article className="sd-page">
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <LevelBadge level={question.level} />
          {question.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
          {question.title}
        </h1>
        <p className="sd-prompt">{question.prompt}</p>
        <SystemDesignArticle sections={question.systemDesignGuide.sections} notes={question.interviewerNotes} />
        {question.sourceRefs.length > 0 && (
          <p className="sd-sources">
            <span>Study deeper</span>
            {question.sourceRefs.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                {source.site}
              </a>
            ))}
          </p>
        )}
        {nextHref && (
          <div className="mt-10 flex justify-end border-t border-[var(--line)] pt-6">
            <Link href={nextHref} className="underline-draw text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)]">
              Next question →
            </Link>
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="animate-fade-up mx-auto max-w-[var(--content-max)] px-5 py-12">
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <LevelBadge level={question.level} />
        {question.pattern && <Tag>{question.pattern}</Tag>}
        {question.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,4vw,2.65rem)] leading-[1.1] tracking-[-0.03em] text-[var(--ink)]">
        {question.title}
      </h1>
      <p className="mt-5 whitespace-pre-wrap text-[1.05rem] leading-[1.7] text-[var(--muted)]">
        {question.prompt}
      </p>

      {question.options && (
        <div className="mt-8 space-y-0">
          {question.options.map((o, i) => {
            const isSelected = selected === o.id;
            const show = checked && isSelected;
            const good = o.correct;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSelected(o.id);
                  setChecked(false);
                }}
                className={`grid w-full grid-cols-[2.5rem_1fr] gap-3 border-b border-[var(--line)] px-1 py-3.5 text-left text-sm transition-colors ${
                  isSelected ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-elevated)]"
                } ${show ? (good ? "text-[var(--success)]" : "text-[var(--danger)]") : ""}`}
              >
                <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{o.label}</span>
              </button>
            );
          })}
          <div className="flex flex-wrap items-center gap-3 pt-5">
            <Button
              size="sm"
              disabled={!selected}
              onClick={() => {
                setChecked(true);
                if (selected === correctId) void rate(3);
                else void rate(1);
              }}
            >
              Check answer
            </Button>
            {checked && (
              <span className="text-sm text-[var(--muted)]">
                {selected === correctId ? "Correct." : "Not quite — use the ladder."}
              </span>
            )}
          </div>
          {question.track === "quiz" && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] pt-4">
              <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                SRS
              </span>
              {(["Again", "Hard", "Good", "Easy"] as const).map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => rate((i + 1) as Rating)}
                  className="underline-draw text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {question.sandbox && (
        <div className="mt-6">
          <PracticeSandbox config={question.sandbox} onPass={setGatePassed} />
        </div>
      )}

      {question.track === "behaviour" && <StarBuilder question={question} />}
      {question.track === "negotiation" && <NegotiationWorksheet question={question} />}

      <ProgressiveReveal
        question={question}
        initialReveal={reveal}
        gated={!!question.sandbox}
        gatePassed={gatePassed}
        nextHref={nextHref}
      />

      {nextHref && (
        <div className="mt-12 flex justify-end border-t border-[var(--line)] pt-6">
          <Link
            href={nextHref}
            className="underline-draw text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)]"
          >
            Next question →
          </Link>
        </div>
      )}
    </article>
  );
}
