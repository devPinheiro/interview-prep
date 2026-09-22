import Link from "next/link";

type Props = {
  trackLabel: string;
  trackHref: string;
  suffix?: string;
};

export function QuestionBreadcrumb({ trackLabel, trackHref, suffix }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-[var(--content-max)] px-5 pt-8 font-[family-name:var(--font-mono)] text-[0.7rem] tracking-wide text-[var(--muted)]"
    >
      <Link href="/" className="underline-draw hover:text-[var(--ink)]">
        Home
      </Link>
      <span className="mx-2 opacity-40">/</span>
      <Link href={trackHref} className="underline-draw hover:text-[var(--ink)]">
        {trackLabel}
      </Link>
      {suffix && (
        <>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-[var(--ink)]">{suffix}</span>
        </>
      )}
    </nav>
  );
}
