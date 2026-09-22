import Link from "next/link";
import { TRACKS } from "@/lib/types";
import { countByTrack } from "@/lib/content";
import { ContinueStudying } from "@/components/ContinueStudying";
import { LevelPicker } from "@/components/LevelPicker";

export default function HomePage() {
  const counts = countByTrack();
  const firstTrack = TRACKS[0];

  return (
    <div>
      {/* One composition: brand + line + CTA on a full-bleed lattice plane */}
      <section className="hero-lattice relative min-h-[min(78vh,640px)] border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-[var(--page-max)] flex-col justify-end px-5 pb-14 pt-20 md:pb-16 md:pt-28">
          <p className="animate-fade-up text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
            Personal study vault
          </p>
          <h1 className="animate-fade-up animate-delay-1 mt-4 max-w-[11ch] font-[family-name:var(--font-display)] text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.92] tracking-[-0.04em] text-[var(--ink)]">
            FrontVault
          </h1>
          <p className="animate-fade-up animate-delay-2 mt-6 max-w-md text-[1.05rem] leading-relaxed text-[var(--muted)]">
            Frontend interviews, beginner to principal — with progressive answers and in-browser
            practice.
          </p>
          <div className="animate-fade-up animate-delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/${firstTrack.id}`}
              className="bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--bg-elevated)] transition-colors hover:bg-[var(--accent)]"
            >
              Start with {firstTrack.label}
            </Link>
            <Link
              href="/dsa"
              className="underline-draw text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Jump to DSA
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--page-max)] px-5 py-12">
        <div className="animate-fade-up grid gap-10 border-b border-[var(--line)] pb-10 md:grid-cols-[1fr_1.2fr] md:items-end">
          <LevelPicker />
          <ContinueStudying />
        </div>

        <section className="pt-4">
          <div className="mb-2 flex items-baseline justify-between gap-4 pt-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-[-0.02em]">
              Tracks
            </h2>
            <p className="text-xs text-[var(--muted)]">Five surfaces. One job each.</p>
          </div>

          <ul className="mt-2">
            {TRACKS.map((t, i) => {
              const c = counts[t.id];
              return (
                <li key={t.id}>
                  <Link
                    href={`/${t.id}`}
                    className="row-shift group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-[var(--line)] py-5 md:grid-cols-[4rem_1fr_auto]"
                    style={{ animationDelay: `${0.05 * i}s` }}
                  >
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="font-[family-name:var(--font-display)] text-[1.65rem] leading-none tracking-[-0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] md:text-[1.85rem]">
                        {t.label}
                      </div>
                      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{t.blurb}</p>
                    </div>
                    <div className="text-right font-[family-name:var(--font-mono)] text-[0.7rem] leading-relaxed text-[var(--muted)]">
                      <div>
                        <span className="text-[var(--accent)]">{c.ready}</span> ready
                      </div>
                      <div>{c.catalog} catalog</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
