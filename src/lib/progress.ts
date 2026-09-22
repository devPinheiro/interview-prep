"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Level, Track } from "./types";
import { parseExportPayload, type ValidatedExportPayload } from "./import-schema";

export type RevealLevel = "none" | "hint" | "approach" | "solution";

export type QuestionProgress = {
  key: string;
  track: Track;
  id: string;
  completed: boolean;
  reveal: RevealLevel;
  lastSeen: number;
  attempts: number;
  due: number;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
};

export type StarDraft = {
  key: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  updatedAt: number;
};

export type RadioDraft = {
  key: string;
  checked: Record<string, boolean>;
  notes: string;
  updatedAt: number;
};

export type NegotiationDraft = {
  key: string;
  fields: Record<string, string>;
  updatedAt: number;
};

export type AppMeta = {
  preferredLevel: Level | "all";
  lastTrack?: Track;
  lastQuestionKey?: string;
};

export type ExportPayload = ValidatedExportPayload;

interface PrepDB extends DBSchema {
  progress: {
    key: string;
    value: QuestionProgress;
  };
  star: {
    key: string;
    value: StarDraft;
  };
  radio: {
    key: string;
    value: RadioDraft;
  };
  negotiation: {
    key: string;
    value: NegotiationDraft;
  };
  meta: {
    key: string;
    value: AppMeta;
  };
}

const DB_NAME = "interview-prep";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PrepDB>> | null = null;
let lastStorageError: string | null = null;

export function getStorageError(): string | null {
  return lastStorageError;
}

export function clearStorageError() {
  lastStorageError = null;
}

function resetDbConnection() {
  dbPromise = null;
}

async function openDb(): Promise<IDBPDatabase<PrepDB> | null> {
  if (typeof window === "undefined") {
    return null;
  }
  if (!("indexedDB" in window)) {
    lastStorageError = "IndexedDB is not available in this browser.";
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<PrepDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("progress", { keyPath: "key" });
          db.createObjectStore("star", { keyPath: "key" });
          db.createObjectStore("radio", { keyPath: "key" });
          db.createObjectStore("negotiation", { keyPath: "key" });
          db.createObjectStore("meta");
        }
      },
      blocked() {
        lastStorageError = "Storage blocked — close other tabs using FrontVault or allow site data.";
      },
      blocking() {
        resetDbConnection();
      },
      terminated() {
        lastStorageError = "Storage connection lost. Refresh the page.";
        resetDbConnection();
      },
    }).catch((err) => {
      resetDbConnection();
      lastStorageError =
        err instanceof Error ? err.message : "Could not open local storage.";
      throw err;
    });
  }
  try {
    return await dbPromise;
  } catch {
    resetDbConnection();
    return null;
  }
}

async function withDb<T>(run: (db: IDBPDatabase<PrepDB>) => Promise<T>, fallback: T): Promise<T> {
  try {
    const db = await openDb();
    if (!db) return fallback;
    return await run(db);
  } catch (err) {
    resetDbConnection();
    lastStorageError =
      err instanceof Error ? err.message : "Local storage read/write failed.";
    return fallback;
  }
}

export async function pingStorage(): Promise<boolean> {
  clearStorageError();
  const db = await openDb();
  if (!db) return false;
  try {
    await db.get("meta", "app");
    return true;
  } catch {
    resetDbConnection();
    lastStorageError = "Storage health check failed.";
    return false;
  }
}

export function progressKey(track: Track, id: string) {
  return `${track}:${id}`;
}

export async function getProgress(track: Track, id: string) {
  return withDb((db) => db.get("progress", progressKey(track, id)), undefined);
}

export async function getAllProgress(): Promise<QuestionProgress[]> {
  return withDb((db) => db.getAll("progress"), []);
}

export async function upsertProgress(
  partial: Partial<QuestionProgress> & { track: Track; id: string },
) {
  return withDb(async (db) => {
    const key = progressKey(partial.track, partial.id);
    const existing = (await db.get("progress", key)) ?? {
      key,
      track: partial.track,
      id: partial.id,
      completed: false,
      reveal: "none" as RevealLevel,
      lastSeen: Date.now(),
      attempts: 0,
      due: Date.now(),
      stability: 0,
      difficulty: 5,
      reps: 0,
      lapses: 0,
    };
    const next = { ...existing, ...partial, key, lastSeen: Date.now() };
    await db.put("progress", next);
    return next;
  }, undefined);
}

export async function getMeta(): Promise<AppMeta> {
  return withDb(
    async (db) => ((await db.get("meta", "app")) as AppMeta | undefined) ?? { preferredLevel: "all" },
    { preferredLevel: "all" },
  );
}

export async function setMeta(meta: Partial<AppMeta>) {
  return withDb(async (db) => {
    const current = ((await db.get("meta", "app")) as AppMeta | undefined) ?? {
      preferredLevel: "all",
    };
    await db.put("meta", { ...current, ...meta }, "app");
  }, undefined);
}

export async function getStarDraft(key: string) {
  return withDb((db) => db.get("star", key), undefined);
}

export async function saveStarDraft(draft: StarDraft) {
  return withDb((db) => db.put("star", draft), undefined);
}

export async function getRadioDraft(key: string) {
  return withDb((db) => db.get("radio", key), undefined);
}

export async function saveRadioDraft(draft: RadioDraft) {
  return withDb((db) => db.put("radio", draft), undefined);
}

export async function getNegotiationDraft(key: string) {
  return withDb((db) => db.get("negotiation", key), undefined);
}

export async function saveNegotiationDraft(draft: NegotiationDraft) {
  return withDb((db) => db.put("negotiation", draft), undefined);
}

const emptyExport = (): ExportPayload => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  progress: [],
  star: [],
  radio: [],
  negotiation: [],
  meta: { preferredLevel: "all" },
});

export async function exportAll(): Promise<ExportPayload> {
  return withDb(async (db) => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: await db.getAll("progress"),
      star: await db.getAll("star"),
      radio: await db.getAll("radio"),
      negotiation: await db.getAll("negotiation"),
      meta: ((await db.get("meta", "app")) as AppMeta | undefined) ?? { preferredLevel: "all" },
    };
  }, emptyExport());
}

export async function importAll(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = parseExportPayload(raw);
  if (!parsed.ok) {
    return parsed;
  }
  const payload = parsed.data;

  const result = await withDb(async (db) => {
    const tx = db.transaction(
      ["progress", "star", "radio", "negotiation", "meta"],
      "readwrite",
    );
    await Promise.all([
      ...payload.progress.map((p) => tx.objectStore("progress").put(p)),
      ...payload.star.map((s) => tx.objectStore("star").put(s)),
      ...payload.radio.map((r) => tx.objectStore("radio").put(r)),
      ...payload.negotiation.map((n) => tx.objectStore("negotiation").put(n)),
      tx.objectStore("meta").put(payload.meta, "app"),
      tx.done,
    ]);
    return true;
  }, false);

  if (!result) {
    return { ok: false, error: getStorageError() ?? "Import failed — storage unavailable." };
  }
  return { ok: true };
}
