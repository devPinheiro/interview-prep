export type Level = "beginner" | "mid" | "senior" | "staff" | "principal";
export type Track = "quiz" | "dsa" | "system-design" | "behaviour" | "negotiation";
export type ContentStatus = "stub" | "drafted" | "ready";

export type SourceRef = {
  site: string;
  url: string;
  note?: string;
};

export type SandboxFile = {
  path: string;
  code: string;
  hidden?: boolean;
  active?: boolean;
};

export type SandboxConfig = {
  template?: "vanilla-ts" | "react-ts" | "test-ts";
  files: SandboxFile[];
  entry?: string;
  dependencies?: Record<string, string>;
};

export type McqOption = {
  id: string;
  label: string;
  correct?: boolean;
};

export type Question = {
  id: string;
  track: Track;
  level: Level;
  title: string;
  tags: string[];
  status: ContentStatus;
  canonicalTopic: string;
  prompt: string;
  hints: string[];
  approach: string;
  solution: string;
  interviewerNotes: string;
  sourceRefs: SourceRef[];
  /** Quiz */
  options?: McqOption[];
  /** DSA / UI coding */
  sandbox?: SandboxConfig;
  pattern?: string;
  /** System design RADIO checkpoints */
  radioSteps?: {
    requirements: string[];
    architecture: string[];
    data: string[];
    interface: string[];
    observability: string[];
  };
  /** Detailed front-end system design walkthrough, revealed with the solution. */
  systemDesignGuide?: {
    framing: string;
    clarifyingQuestions: string[];
    componentTree: string[];
    stateModel: { name: string; owner: string; notes: string }[];
    interfaces: { name: string; contract: string; why: string }[];
    decisions: { decision: string; tradeoff: string }[];
    deepDives: { title: string; content: string }[];
    close: string;
  };
  /** Behaviour */
  competencies?: string[];
  starModel?: {
    situation: string;
    task: string;
    action: string;
    result: string;
    reflection: string;
  };
  /** Negotiation */
  scripts?: { title: string; when: string; say: string; avoid: string }[];
  worksheetFields?: string[];
};

export type CatalogEntry = {
  id: string;
  track: Track;
  level: Level;
  canonicalTopic: string;
  title: string;
  sourceRefs: SourceRef[];
  status: ContentStatus;
  tags?: string[];
};

export const LEVELS: Level[] = ["beginner", "mid", "senior", "staff", "principal"];

export const TRACKS: { id: Track; label: string; blurb: string }[] = [
  { id: "quiz", label: "Quiz", blurb: "JS, CSS, browser, React trivia" },
  { id: "dsa", label: "DSA", blurb: "Patterns + UI machine coding" },
  { id: "system-design", label: "System Design", blurb: "RADIO frontend architecture" },
  { id: "behaviour", label: "Behaviour", blurb: "STAR(R) stories by level" },
  { id: "negotiation", label: "Negotiation", blurb: "Scripts, TC, offers" },
];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
  principal: "Principal",
};
