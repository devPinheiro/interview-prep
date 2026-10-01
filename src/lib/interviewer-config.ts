export type InterviewerConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

const STORAGE_KEY = "frontvault.interviewer";

export const DEFAULT_INTERVIEWER: InterviewerConfig = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "",
};

export function loadInterviewerConfig(): InterviewerConfig {
  if (typeof window === "undefined") return DEFAULT_INTERVIEWER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INTERVIEWER;
    const parsed = JSON.parse(raw) as Partial<InterviewerConfig>;
    return {
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      model:
        typeof parsed.model === "string" && parsed.model.trim()
          ? parsed.model.trim()
          : DEFAULT_INTERVIEWER.model,
      baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl.trim() : "",
    };
  } catch {
    return DEFAULT_INTERVIEWER;
  }
}

export function saveInterviewerConfig(config: InterviewerConfig) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey: config.apiKey.trim(),
      model: config.model.trim() || DEFAULT_INTERVIEWER.model,
      baseUrl: config.baseUrl.trim(),
    }),
  );
}
