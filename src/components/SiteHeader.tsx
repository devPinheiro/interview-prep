"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRACKS } from "@/lib/types";
import { cn } from "@/lib/cn";
import { MobileNav } from "@/components/MobileNav";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--page-max)] items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[1.35rem] tracking-[-0.03em] text-[var(--ink)]"
        >
          FrontVault
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {TRACKS.map((t) => {
            const active = pathname === `/${t.id}` || pathname.startsWith(`/${t.id}/`);
            return (
              <Link
                key={t.id}
                href={`/${t.id}`}
                data-active={active}
                className={cn(
                  "underline-draw text-[0.8125rem] tracking-wide transition-colors",
                  active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                {t.label}
              </Link>
            );
          })}
          <Link
            href="/review"
            data-active={pathname === "/review"}
            className={cn(
              "underline-draw text-[0.8125rem] text-[var(--muted)] hover:text-[var(--ink)]",
              pathname === "/review" && "text-[var(--ink)]",
            )}
          >
            Review
          </Link>
          <Link
            href="/settings"
            data-active={pathname === "/settings"}
            className={cn(
              "underline-draw text-[0.8125rem] text-[var(--muted)] hover:text-[var(--ink)]",
              pathname === "/settings" && "text-[var(--ink)]",
            )}
          >
            Data
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
