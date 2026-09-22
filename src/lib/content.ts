import type { Level, Question, Track } from "./types";
import { questionsByTrack, allAuthoredQuestions } from "./content-registry";
import { catalogEntries } from "@/content/catalog";

export function getAllQuestions(): Question[] {
  return allAuthoredQuestions();
}

export function getQuestionsByTrack(track: Track, level?: Level | "all"): Question[] {
  const list = questionsByTrack[track] ?? [];
  if (!level || level === "all") return list;
  return list.filter((q) => q.level === level);
}

export function getQuestion(track: Track, id: string): Question | undefined {
  return questionsByTrack[track]?.find((q) => q.id === id);
}

export function getCatalog() {
  return catalogEntries;
}

export function getCatalogByTrack(track: Track) {
  return catalogEntries.filter((c) => c.track === track);
}

export function getContinueCandidates(completedIds: Set<string>): Question[] {
  return getAllQuestions()
    .filter((q) => q.status === "ready" && !completedIds.has(`${q.track}:${q.id}`))
    .slice(0, 12);
}

export function countByTrack(): Record<Track, { total: number; ready: number; catalog: number }> {
  const result = {} as Record<Track, { total: number; ready: number; catalog: number }>;
  (Object.keys(questionsByTrack) as Track[]).forEach((track) => {
    const list = questionsByTrack[track];
    result[track] = {
      total: list.length,
      ready: list.filter((q) => q.status === "ready").length,
      catalog: catalogEntries.filter((c) => c.track === track).length,
    };
  });
  return result;
}

export function stubFromCatalog(id: string): Question | undefined {
  const entry = catalogEntries.find((c) => c.id === id);
  if (!entry || entry.status === "ready") return undefined;
  return {
    id: entry.id,
    track: entry.track,
    level: entry.level,
    title: entry.title,
    tags: entry.tags ?? [],
    status: entry.status,
    canonicalTopic: entry.canonicalTopic,
    prompt: `This topic is catalogued from public interview lists. Draft your own answer, then follow the source links for more practice. We do not republish third-party solutions.`,
    hints: ["Outline aloud for 60 seconds.", "Write the key trade-offs before opening sources."],
    approach: "Structure your answer, then compare against reputable sources linked below.",
    solution:
      "Original solution not authored yet — this is a stub. Use source links for deeper study, then contribute an original write-up.",
    interviewerNotes: "Stubs keep coverage wide while answers are authored in waves.",
    sourceRefs: entry.sourceRefs,
  };
}
