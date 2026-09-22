"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllProgress } from "@/lib/progress";
import { getQuestion } from "@/lib/content";
import type { Track } from "@/lib/types";
import { isDue } from "@/lib/fsrs";

type DueItem = {
  key: string;
  track: Track;
  id: string;
  title: string;
  due: number;
};

export default function ReviewPage() {
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const progress = await getAllProgress();
      const now = Date.now();
      const due: DueItem[] = [];
      for (const p of progress) {
        if (p.track !== "quiz") continue;
        if (!isDue({ due: p.due, stability: p.stability, difficulty: p.difficulty, reps: p.reps, lapses: p.lapses }, now)) {
          continue;
        }
        const q = getQuestion(p.track, p.id);
        if (!q) continue;
        due.push({
          key: p.key,
          track: p.track,
          id: p.id,
          title: q.title,
          due: p.due,
        });
      }
      due.sort((a, b) => a.due - b.due);
      setItems(due);
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-5 py-12">
      <p className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--accent)]">
        Spaced review
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-[-0.03em]">
        Quiz review
      </h1>
      <p className="mt-4 max-w-md text-[var(--muted)]">
        Cards you rated on quiz questions and marked due for another pass. Rate again after you
        attempt.
      </p>

      {loading && <p className="mt-10 text-sm text-[var(--muted)]">Loading…</p>}

      {!loading && items.length === 0 && (
        <p className="mt-10 border-t border-[var(--line)] pt-8 text-sm text-[var(--muted)]">
          Nothing due. Practice quiz questions and use the SRS buttons (Again / Good / Easy) to
          schedule reviews.
        </p>
      )}

      <ul className="mt-8">
        {items.map((item, i) => (
          <li key={item.key}>
            <Link
              href={`/${item.track}/${item.id}`}
              className="row-shift grid grid-cols-[2.5rem_1fr] gap-4 border-b border-[var(--line)] py-4"
            >
              <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium tracking-[-0.01em] text-[var(--ink)] hover:text-[var(--accent)]">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
