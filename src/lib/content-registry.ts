import { quizQuestions } from "@/content/quiz";
import { dsaQuestions } from "@/content/dsa";
import { systemDesignQuestions } from "@/content/system-design";
import { behaviourQuestions } from "@/content/behaviour";
import { negotiationQuestions } from "@/content/negotiation";
import type { Question, Track } from "@/lib/types";

export const questionsByTrack: Record<Track, Question[]> = {
  quiz: quizQuestions,
  dsa: dsaQuestions,
  "system-design": systemDesignQuestions,
  behaviour: behaviourQuestions,
  negotiation: negotiationQuestions,
};

export function allAuthoredQuestions(): Question[] {
  return Object.values(questionsByTrack).flat();
}
