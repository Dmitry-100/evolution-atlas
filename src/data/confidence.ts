export type ConfidenceLevel = "solid" | "likely" | "debated";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  solid: "подтверждено",
  likely: "вероятно",
  debated: "обсуждается",
};
