"use client";

import { useEffect, useState } from "react";
import { getStorageError, pingStorage } from "@/lib/progress";

export function StorageBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void pingStorage().then((ok) => {
      if (!ok) setMessage(getStorageError());
    });
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        void pingStorage().then((ok) => {
          setMessage(ok ? null : getStorageError());
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      className="border-b border-[var(--danger)]/30 bg-[var(--danger)]/10 px-5 py-2 text-center text-sm text-[var(--ink)]"
    >
      {message} Progress may not save until this is resolved. Use{" "}
      <strong className="font-normal text-[var(--danger)]">Data → Export</strong> when storage works.
    </div>
  );
}
