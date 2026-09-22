import Link from "next/link";
import { cn } from "@/lib/cn";
import { LevelBadge, StatusDot, Tag } from "./Badge";
import type { Question } from "@/lib/types";

type Props = {
  question: Question;
  href: string;
  done?: boolean;
  index?: number;
};

export function ListRow({ question, href, done, index }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "row-shift group grid grid-cols-[1.5rem_2.5rem_1fr_auto] items-center gap-3 border-b border-[var(--line)] py-4 md:grid-cols-[1.5rem_3rem_1fr_auto]",
      )}
    >
      <StatusDot status={question.status} />
      <span className="font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)] tabular-nums">
        {index !== undefined ? String(index + 1).padStart(2, "0") : "—"}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[0.95rem] font-medium tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
            {question.title}
          </span>
          {done && (
            <span className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-wider text-[var(--accent)]">
              done
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {question.tags.slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>
      <LevelBadge level={question.level} />
    </Link>
  );
}
