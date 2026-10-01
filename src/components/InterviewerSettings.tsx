"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_INTERVIEWER,
  loadInterviewerConfig,
  saveInterviewerConfig,
  type InterviewerConfig,
} from "@/lib/interviewer-config";

export function InterviewerSettings() {
  const [config, setConfig] = useState<InterviewerConfig>(DEFAULT_INTERVIEWER);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(loadInterviewerConfig());
  }, []);

  function update(patch: Partial<InterviewerConfig>) {
    setSaved(false);
    setConfig((current) => ({ ...current, ...patch }));
  }

  return (
    <form
      className="mt-12 border-t border-[var(--line)] pt-8"
      onSubmit={(event) => {
        event.preventDefault();
        saveInterviewerConfig(config);
        setSaved(true);
      }}
    >
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-[-0.03em]">
        Interviewer
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        The key is stored in this browser only. It is not part of the progress export. Leave the
        base URL empty for OpenAI, or set <span className="text-[var(--ink)]">http://127.0.0.1:11434/v1</span>{" "}
        for a local model.
      </p>
      <label className="mt-6 block text-sm">
        API key
        <input
          type="password"
          autoComplete="off"
          value={config.apiKey}
          onChange={(event) => update({ apiKey: event.target.value })}
          className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[var(--ink)]"
        />
      </label>
      <label className="mt-4 block text-sm">
        Model
        <input
          value={config.model}
          onChange={(event) => update({ model: event.target.value })}
          className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[var(--ink)]"
        />
      </label>
      <label className="mt-4 block text-sm">
        Base URL
        <input
          value={config.baseUrl}
          placeholder="https://api.openai.com/v1"
          onChange={(event) => update({ baseUrl: event.target.value })}
          className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)] text-sm outline-none focus:border-[var(--ink)]"
        />
      </label>
      <Button className="mt-5" type="submit">
        Save interviewer
      </Button>
      {saved && (
        <p className="mt-3 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--accent)]">
          Saved on this device.
        </p>
      )}
    </form>
  );
}
