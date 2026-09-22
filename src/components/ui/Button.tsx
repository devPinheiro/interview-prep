import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "line" | "danger";
  size?: "sm" | "md";
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-[background-color,color,border-color,opacity] duration-200 disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "px-2.5 py-1.5 text-[0.8125rem]" : "px-4 py-2 text-sm",
        variant === "primary" &&
          "bg-[var(--ink)] text-[var(--bg-elevated)] hover:bg-[var(--accent)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]",
        variant === "line" &&
          "border border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--ink)]",
        variant === "danger" && "bg-[var(--danger)] text-white hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
