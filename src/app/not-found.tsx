import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-5 py-20 text-center">
      <p className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">
        404
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl tracking-[-0.02em]">
        Not in the catalog
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-[var(--muted)]">
        That track or question does not exist. Pick another from the home page.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-[var(--accent)] underline-draw"
      >
        Back to home
      </Link>
    </div>
  );
}
