import { quizQuestions } from "@/content/quiz";
import { authoredQuizStubs } from "@/content/quiz-stubs-authored";
import { quizWave } from "@/content/quiz-wave";
import { dsaQuestions } from "@/content/dsa";
import { authoredDsaStubs } from "@/content/dsa-stubs-authored";
import { dsaWave } from "@/content/dsa-wave";
import { systemDesignQuestions } from "@/content/system-design";
import { authoredSystemDesignStubs } from "@/content/system-design-stubs-authored";
import { systemDesignWave } from "@/content/system-design-wave";
import { systemDesignWave2 } from "@/content/system-design-wave-2";
import { behaviourQuestions } from "@/content/behaviour";
import { authoredBehaviourStubs } from "@/content/behaviour-stubs-authored";
import { negotiationQuestions } from "@/content/negotiation";
import { negotiationWave } from "@/content/negotiation-wave";
import type { Question, Track } from "@/lib/types";

export const questionsByTrack: Record<Track, Question[]> = {
  quiz: [...quizQuestions, ...authoredQuizStubs, ...quizWave],
  dsa: [...dsaQuestions, ...authoredDsaStubs, ...dsaWave],
  "system-design": [
    ...systemDesignQuestions,
    ...authoredSystemDesignStubs,
    ...systemDesignWave,
    ...systemDesignWave2,
  ],
  behaviour: [...behaviourQuestions, ...authoredBehaviourStubs],
  negotiation: [...negotiationQuestions, ...negotiationWave],
};

export function allAuthoredQuestions(): Question[] {
  return Object.values(questionsByTrack).flat();
}
