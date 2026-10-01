import type { Level, Question, Track } from "@/lib/types";

export type InterviewBrief = {
  id: string;
  track: Track;
  level: Level;
  title: string;
  prompt: string;
  rubric: string;
};

function clip(value: string, max: number) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

/** Compact original prompt plus a private rubric. No sandbox sources, no third-party articles. */
export function toInterviewBrief(question: Question): InterviewBrief {
  const extra: string[] = [];
  if (question.starModel) {
    const star = question.starModel;
    extra.push(
      `Reference story shape: Situation ${clip(star.situation, 280)} Task ${clip(star.task, 200)} Action ${clip(star.action, 320)} Result ${clip(star.result, 200)} Reflection ${clip(star.reflection, 200)}`,
    );
  }
  if (question.scripts?.length) {
    extra.push(
      `Script bar: ${question.scripts
        .map((script) => `${script.title} — say: ${clip(script.say, 220)} Avoid: ${clip(script.avoid, 120)}`)
        .join(" | ")}`,
    );
  }
  if (question.radioSteps) {
    const steps = question.radioSteps;
    extra.push(
      `Design checkpoints: requirements ${steps.requirements.join("; ")}; architecture ${steps.architecture.join("; ")}; data ${steps.data.join("; ")}; interface ${steps.interface.join("; ")}; observability ${steps.observability.join("; ")}`,
    );
  }

  const rubric = [
    question.hints.length ? `Hints: ${question.hints.join(" ")}` : "",
    question.approach ? `Approach: ${clip(question.approach, 900)}` : "",
    question.solution ? `Solution notes: ${clip(question.solution, 1200)}` : "",
    question.interviewerNotes ? `Listen for: ${clip(question.interviewerNotes, 400)}` : "",
    ...extra,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: question.id,
    track: question.track,
    level: question.level,
    title: question.title,
    prompt: question.prompt,
    rubric: clip(rubric, 2800),
  };
}
