import { CONFIDENCE_LABELS, type ConfidenceLevel } from "../../data/confidence";
import { cn } from "../../lib/utils";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
  className?: string;
};

export function ConfidenceBadge({ level, className }: ConfidenceBadgeProps) {
  return (
    <span className={cn("confidence-badge", `confidence-badge--${level}`, className)}>
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}
