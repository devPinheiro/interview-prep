import { quizQuestions } from "@/content/quiz";
import { authoredQuizStubs } from "@/content/quiz-stubs-authored";
import { dsaQuestions } from "@/content/dsa";
import { authoredDsaStubs } from "@/content/dsa-stubs-authored";
import { systemDesignQuestions } from "@/content/system-design";
import { authoredSystemDesignStubs } from "@/content/system-design-stubs-authored";
import { behaviourQuestions } from "@/content/behaviour";
import { authoredBehaviourStubs } from "@/content/behaviour-stubs-authored";
import { negotiationQuestions } from "@/content/negotiation";
import type { Question, Track } from "@/lib/types";

export const questionsByTrack: Record<Track, Question[]> = {
  quiz: [...quizQuestions, ...authoredQuizStubs],
  dsa: [...dsaQuestions, ...authoredDsaStubs],
  "system-design": [...systemDesignQuestions, ...authoredSystemDesignStubs],
  behaviour: [...behaviourQuestions, ...authoredBehaviourStubs],
  negotiation: negotiationQuestions,
};

export function allAuthoredQuestions(): Question[] {
  return Object.values(questionsByTrack).flat();
}
