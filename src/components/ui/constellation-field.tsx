import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

type ConstellationFieldProps = {
  className?: string;
  compact?: boolean;
};

const nodes = [
  { left: 6, top: 66, size: 6, delay: 0 },
  { left: 17, top: 42, size: 4, delay: 0.2 },
  { left: 28, top: 56, size: 5, delay: 0.45 },
  { left: 39, top: 34, size: 4, delay: 0.1 },
  { left: 52, top: 46, size: 7, delay: 0.7 },
  { left: 64, top: 29, size: 4, delay: 0.35 },
  { left: 76, top: 51, size: 5, delay: 0.55 },
  { left: 88, top: 38, size: 4, delay: 0.25 },
];

export function ConstellationField({ className, compact = false }: ConstellationFieldProps) {
  return (
    <div className={cn("constellation-field", compact && "constellation-field-compact", className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="6,66 17,42 28,56 39,34 52,46 64,29 76,51 88,38" />
        <polyline points="28,56 52,46 76,51" />
      </svg>
      {nodes.map((node, index) => (
        <span
          key={`${node.left}-${node.top}`}
          style={
            {
              "--node-left": `${node.left}%`,
              "--node-top": `${node.top}%`,
              "--node-size": `${compact ? Math.max(3, node.size - 1) : node.size}px`,
              "--node-delay": `${node.delay + index * 0.06}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

