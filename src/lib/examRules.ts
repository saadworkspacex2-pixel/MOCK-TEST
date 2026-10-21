export type ExamRules = {
  antiCheat?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showExplanations?: boolean;
  hideResults?: boolean;
  sectionTimeMinutes?: number;
};

export function rulesOf(value: unknown): ExamRules {
  if (value && typeof value === "object") return value as ExamRules;
  return {};
}
