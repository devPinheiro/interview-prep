"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProgress, getMeta } from "@/lib/progress";
import { getAllQuestions, getQuestion } from "@/lib/content";
import type { Track } from "@/lib/types";

export function ContinueStudying() {
  const [href, setHref] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    async function load() {
      const meta = await getMeta();
      const progress = await getAllProgress();
      const completed = new Set(progress.filter((p) => p.completed).map((p) => p.key));
      const now = Date.now();
      const due = progress.filter((p) => p.due <= now && p.track === "quiz").length;
      setDueCount(due);

      if (meta.lastQuestionKey) {
        const [track, ...rest] = meta.lastQuestionKey.split(":");
        const id = rest.join(":");
        const q = getQuestion(track as Track, id);
        if (q) {
          setHref(`/${track}/${id}`);
          setLabel(q.title);
          return;
        }
      }

      const next = getAllQuestions().find((q) => !completed.has(`${q.track}:${q.id}`));
      if (next) {
        setHref(`/${next.track}/${next.id}`);
        setLabel(next.title);
      }
    }
    void load();
  }, []);

  if (!href) {
    return (
      <div className="border-l-2 border-[var(--line)] pl-5">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">Continue</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Pick a track to begin.</p>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-[var(--accent)] pl-5">
      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--accent)]">Continue</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-xl leading-snug tracking-[-0.02em] text-[var(--ink)]">
        {label}
      </p>
      {dueCount > 0 && (
        <Link
          href="/review"
          className="mt-1 inline-block font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--accent)] underline-draw"
        >
          {dueCount} quiz review{dueCount === 1 ? "" : "s"} due →
        </Link>
      )}
      <Link
        href={href}
        className="mt-4 inline-block text-sm font-medium text-[var(--accent)] underline-draw"
      >
        Resume →
      </Link>
    </div>
  );
}
