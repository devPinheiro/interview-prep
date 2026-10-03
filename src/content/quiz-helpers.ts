import type { Level, Question, SourceRef } from "@/lib/types";

export const mdn: SourceRef[] = [{ site: "mdn", url: "https://developer.mozilla.org/en-US/docs/Web" }];
export const reactRefs: SourceRef[] = [{ site: "react-dev", url: "https://react.dev/reference/react" }];
export const tsRefs: SourceRef[] = [{ site: "typescript", url: "https://www.typescriptlang.org/docs/handbook/intro.html" }];
export const owaspRefs: SourceRef[] = [{ site: "owasp", url: "https://cheatsheetseries.owasp.org/" }];
export const webDevRefs: SourceRef[] = [{ site: "web-dev", url: "https://web.dev/learn" }];
export const nextRefs: SourceRef[] = [{ site: "nextjs", url: "https://nextjs.org/docs" }];

/** Rotate the correct answer through a/b/c/d so it is not always in the same slot. */
function position(topic: string): number {
  let hash = 0;
  for (const char of topic) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 4;
}

export type QuizInput = {
  topic: string;
  title: string;
  level: Level;
  tags: string[];
  prompt: string;
  hints: [string, string];
  approach: string;
  solution: string;
  notes: string;
  correct: string;
  wrong: [string, string, string];
  refs?: SourceRef[];
};

/** Build a ready multiple-choice quiz question with a deterministic answer slot. */
export function makeQuiz(idPrefix: string, input: QuizInput): Question {
  const labels = [...input.wrong];
  labels.splice(position(input.topic), 0, input.correct);
  const ids = ["a", "b", "c", "d"];
  return {
    id: `${idPrefix}-${input.topic}`,
    track: "quiz",
    level: input.level,
    title: input.title,
    tags: input.tags,
    status: "ready",
    canonicalTopic: input.topic,
    prompt: input.prompt,
    hints: input.hints,
    approach: input.approach,
    solution: input.solution,
    interviewerNotes: input.notes,
    sourceRefs: input.refs ?? mdn,
    options: labels.map((label, i) => ({
      id: ids[i],
      label,
      ...(label === input.correct ? { correct: true } : {}),
    })),
  };
}
