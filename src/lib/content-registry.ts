import { quizQuestions } from "@/content/quiz";
import { authoredQuizStubs } from "@/content/quiz-stubs-authored";
import { quizWave } from "@/content/quiz-wave";
import { quizWave2 } from "@/content/quiz-wave-2";
import { quizWave3 } from "@/content/quiz-wave-3";
import { quizWave4 } from "@/content/quiz-wave-4";
import { dsaQuestions } from "@/content/dsa";
import { authoredDsaStubs } from "@/content/dsa-stubs-authored";
import { dsaWave } from "@/content/dsa-wave";
import { dsaWave2 } from "@/content/dsa-wave-2";
import { systemDesignQuestions } from "@/content/system-design";
import { authoredSystemDesignStubs } from "@/content/system-design-stubs-authored";
import { systemDesignWave } from "@/content/system-design-wave";
import { systemDesignWave2 } from "@/content/system-design-wave-2";
import { behaviourQuestions } from "@/content/behaviour";
import { authoredBehaviourStubs } from "@/content/behaviour-stubs-authored";
import { behaviourWave } from "@/content/behaviour-wave";
import { negotiationQuestions } from "@/content/negotiation";
import { negotiationWave } from "@/content/negotiation-wave";
import { negotiationWave2 } from "@/content/negotiation-wave-2";
import type { Question, Track } from "@/lib/types";

export const questionsByTrack: Record<Track, Question[]> = {
  quiz: [...quizQuestions, ...authoredQuizStubs, ...quizWave, ...quizWave2, ...quizWave3, ...quizWave4],
  dsa: [...dsaQuestions, ...authoredDsaStubs, ...dsaWave, ...dsaWave2],
  "system-design": [
    ...systemDesignQuestions,
    ...authoredSystemDesignStubs,
    ...systemDesignWave,
    ...systemDesignWave2,
  ],
  behaviour: [...behaviourQuestions, ...authoredBehaviourStubs, ...behaviourWave],
  negotiation: [...negotiationQuestions, ...negotiationWave, ...negotiationWave2],
};

export function allAuthoredQuestions(): Question[] {
  return Object.values(questionsByTrack).flat();
}
