import { useId } from "react";
import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

type FloatingPathsProps = {
  className?: string;
  density?: "hero" | "panel";
};

const heroPaths = [
  "M-60 390 C 150 315, 250 420, 430 315 S 720 214, 920 290 S 1180 368, 1300 225",
  "M-40 270 C 140 210, 300 250, 450 175 S 730 96, 930 170 S 1130 250, 1260 130",
  "M-20 470 C 170 408, 295 506, 520 410 S 800 330, 1050 420 S 1230 470, 1310 370",
  "M-80 140 C 85 116, 220 78, 390 116 S 640 205, 850 116 S 1110 66, 1290 110",
  "M35 525 C 210 455, 400 560, 565 478 S 782 390, 970 470 S 1190 540, 1270 450",
];

const panelPaths = [
  "M-50 250 C 140 195, 285 262, 430 205 S 650 150, 850 210 S 1060 270, 1240 185",
  "M-60 340 C 155 275, 312 360, 520 292 S 790 230, 1010 310 S 1190 365, 1300 288",
  "M-30 145 C 150 95, 310 160, 470 120 S 740 52, 920 124 S 1130 175, 1275 106",
];

export function FloatingPaths({ className, density = "hero" }: FloatingPathsProps) {
  const gradientId = `floating-paths-${useId().replaceAll(":", "")}`;
  const paths = density === "hero" ? heroPaths : panelPaths;

  return (
    <svg className={cn("floating-paths", `floating-paths-${density}`, className)} viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="var(--teal)" stopOpacity="0" />
          <stop offset="28%" stopColor="var(--teal)" stopOpacity="0.66" />
          <stop offset="62%" stopColor="var(--amber)" stopOpacity="0.68" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((path, index) => (
        <path
          // The path order is fixed; it drives staggered CSS motion.
          key={path}
          d={path}
          pathLength={1}
          style={{ "--path-index": index } as CSSProperties}
          stroke={`url(#${gradientId})`}
        />
      ))}
    </svg>
  );
}
