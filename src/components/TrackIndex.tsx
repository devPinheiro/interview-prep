"use client";

import { useEffect, useMemo, useState } from "react";
import { ListRow } from "@/components/ui/ListRow";
import { LevelBadge, StatusDot } from "@/components/ui/Badge";
import type { CatalogEntry, Level, Question, Track } from "@/lib/types";
import { LEVELS, LEVEL_LABELS } from "@/lib/types";
import { getAllProgress, getMeta } from "@/lib/progress";
import { cn } from "@/lib/cn";
import Link from "next/link";

type Props = {
  track: Track;
  questions: Question[];
  catalog: CatalogEntry[];
  label: string;
  blurb: string;
};

export function TrackIndex({ track, questions, catalog, label, blurb }: Props) {
  const [level, setLevel] = useState<Level | "all">("all");
  const [status, setStatus] = useState<"all" | "ready" | "stub">("all");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [stubPage, setStubPage] = useState(0);
  const STUB_PAGE_SIZE = 40;

  useEffect(() => {
    getMeta().then((m) => {
      if (m.preferredLevel) setLevel(m.preferredLevel);
    });
    getAllProgress().then((p) => {
      setDone(new Set(p.filter((x) => x.completed).map((x) => x.key)));
    });
  }, []);

  const authoredIds = useMemo(() => new Set(questions.map((x) => x.canonicalTopic)), [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      if (level !== "all" && item.level !== level) return false;
      if (status === "stub") return false;
      if (status === "ready" && item.status !== "ready") return false;
      if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [questions, level, status, q]);

  const stubCatalog = useMemo(() => {
    return catalog.filter((c) => {
      if (c.status === "ready") return false;
      if (authoredIds.has(c.canonicalTopic)) return false;
      if (level !== "all" && c.level !== level) return false;
      if (status === "ready") return false;
      if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [catalog, authoredIds, level, status, q]);

  const stubTotalPages = Math.max(1, Math.ceil(stubCatalog.length / STUB_PAGE_SIZE));
  const stubPageSafe = Math.min(stubPage, stubTotalPages - 1);
  const stubSlice = stubCatalog.slice(
    stubPageSafe * STUB_PAGE_SIZE,
    stubPageSafe * STUB_PAGE_SIZE + STUB_PAGE_SIZE,
  );

  return (
    <div className="mx-auto max-w-[var(--page-max)] px-5 py-12">
      <p className="animate-fade-up font-[family-name:var(--font-mono)] text-[0.7rem] tracking-wide text-[var(--muted)]">
        <Link href="/" className="underline-draw hover:text-[var(--ink)]">
          Home
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-[var(--ink)]">{label}</span>
      </p>

      <header className="animate-fade-up animate-delay-1 mt-6 max-w-xl border-b border-[var(--line)] pb-8">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
          {label}
        </h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-[var(--muted)]">{blurb}</p>
      </header>

      <div className="animate-fade-up animate-delay-2 mt-8 flex flex-col gap-6 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <label className="block max-w-xs flex-1">
          <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            Search
          </span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setStubPage(0);
            }}
            className="w-full border-b border-[var(--line)] bg-transparent py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            placeholder="Filter titles…"
          />
        </label>
        <div>
          <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            Level
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <FilterLink
              active={level === "all"}
              onClick={() => {
                setLevel("all");
                setStubPage(0);
              }}
            >
              All
            </FilterLink>
            {LEVELS.map((l) => (
              <FilterLink
                key={l}
                active={level === l}
                onClick={() => {
                  setLevel(l);
                  setStubPage(0);
                }}
              >
                {LEVEL_LABELS[l]}
              </FilterLink>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            Status
          </span>
          <div className="flex gap-x-4">
            {(["all", "ready", "stub"] as const).map((s) => (
              <FilterLink
                key={s}
                active={status === s}
                onClick={() => {
                  setStatus(s);
                  setStubPage(0);
                }}
              >
                {s}
              </FilterLink>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-fade-up animate-delay-3 mt-2">
        {filteredQuestions.map((item, i) => (
          <ListRow
            key={item.id}
            question={item}
            href={`/${track}/${item.id}`}
            done={done.has(`${track}:${item.id}`)}
            index={i}
          />
        ))}
        {filteredQuestions.length === 0 && (
          <p className="py-10 text-sm text-[var(--muted)]">No ready questions match these filters.</p>
        )}
      </div>

      {stubCatalog.length > 0 && status !== "ready" && (
        <div className="mt-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.02em] text-[var(--ink)]">
            Catalog stubs
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            {stubCatalog.length.toLocaleString()} curated titles from public interview lists —
            prompts and source links only until we author original answers.
          </p>
          <div className="mt-6">
            {stubSlice.map((c, i) => (
              <Link
                key={c.id}
                href={`/${track}/stub/${c.id}`}
                className="row-shift grid grid-cols-[1.5rem_2.5rem_1fr_auto] items-center gap-3 border-b border-[var(--line)] py-4 md:grid-cols-[1.5rem_3rem_1fr_auto]"
              >
                <StatusDot status={c.status} />
                <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                  {String(stubPageSafe * STUB_PAGE_SIZE + i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] font-medium">{c.title}</span>
                <LevelBadge level={c.level} />
              </Link>
            ))}
          </div>
          {stubTotalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
              <p className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                Page {stubPageSafe + 1} / {stubTotalPages}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  disabled={stubPageSafe <= 0}
                  onClick={() => setStubPage((p) => Math.max(0, p - 1))}
                  className="underline-draw text-sm text-[var(--muted)] disabled:opacity-30 hover:text-[var(--ink)]"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={stubPageSafe >= stubTotalPages - 1}
                  onClick={() => setStubPage((p) => Math.min(stubTotalPages - 1, p + 1))}
                  className="underline-draw text-sm text-[var(--muted)] disabled:opacity-30 hover:text-[var(--ink)]"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "underline-draw pb-0.5 text-sm capitalize transition-colors",
        active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
      )}
    >
      {children}
    </button>
  );
}
