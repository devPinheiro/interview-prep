"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { exportAll, getStorageError, importAll, pingStorage } from "@/lib/progress";

export default function SettingsPage() {
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"ok" | "err">("ok");
  const [storageOk, setStorageOk] = useState<boolean | null>(null);

  useEffect(() => {
    void pingStorage().then(setStorageOk);
  }, []);

  async function onExport() {
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `frontvault-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessageTone("ok");
      setMessage("Exported progress JSON.");
    } catch {
      setMessageTone("err");
      setMessage("Export failed.");
    }
  }

  async function onImport(file: File) {
    setMessage("");
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      setMessageTone("err");
      setMessage("File is not valid JSON.");
      return;
    }
    const result = await importAll(raw);
    if (!result.ok) {
      setMessageTone("err");
      setMessage(result.error);
      return;
    }
    setMessageTone("ok");
    setMessage("Imported progress. Refresh track pages to see status.");
    void pingStorage().then(setStorageOk);
  }

  return (
    <div className="mx-auto max-w-[var(--content-max)] px-5 py-14">
      <p className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">
        Local only
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-[-0.03em]">
        Data
      </h1>
      <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-[var(--muted)]">
        Progress, STAR drafts, RADIO notes, and negotiation worksheets stay in IndexedDB on this
        device. Export a backup anytime.
      </p>

      {storageOk === false && (
        <p className="mt-4 border-l-2 border-[var(--danger)] pl-4 text-sm text-[var(--danger)]">
          {getStorageError() ?? "Local storage is unavailable."}
        </p>
      )}
      {storageOk === true && (
        <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--accent)]">
          Storage OK
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--line)] pt-8">
        <Button onClick={onExport}>Export JSON</Button>
        <label className="inline-flex cursor-pointer items-center border border-[var(--line)] px-4 py-2 text-sm hover:border-[var(--ink)]">
          Import JSON
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {message && (
        <p
          className={`mt-6 font-[family-name:var(--font-mono)] text-sm ${
            messageTone === "err" ? "text-[var(--danger)]" : "text-[var(--accent)]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
