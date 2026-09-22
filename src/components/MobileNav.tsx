"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { TRACKS } from "@/lib/types";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-[var(--line)]"
      >
        <span
          className={cn(
            "block h-px w-4 bg-[var(--ink)] transition-transform",
            open && "translate-y-[3.5px] rotate-45",
          )}
        />
        <span
          className={cn(
            "block h-px w-4 bg-[var(--ink)] transition-opacity",
            open && "opacity-0",
          )}
        />
        <span
          className={cn(
            "block h-px w-4 bg-[var(--ink)] transition-transform",
            open && "-translate-y-[3.5px] -rotate-45",
          )}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-[var(--ink)]/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed right-0 top-[var(--header-h)] z-50 w-[min(100%,280px)] border-l border-[var(--line)] bg-[var(--bg-elevated)] px-5 py-6 shadow-none">
            <p className="mb-4 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-[var(--muted)]">
              Tracks
            </p>
            <ul className="space-y-1">
              {TRACKS.map((t) => {
                const active = pathname === `/${t.id}` || pathname.startsWith(`/${t.id}/`);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/${t.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-2 font-[family-name:var(--font-display)] text-xl tracking-[-0.02em]",
                        active ? "text-[var(--accent)]" : "text-[var(--ink)]",
                      )}
                    >
                      {t.label}
                    </Link>
                  </li>
                );
              })}
              <li className="border-t border-[var(--line)] pt-3 mt-3">
                <Link
                  href="/review"
                  onClick={() => setOpen(false)}
                  className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Quiz review
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Data
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
