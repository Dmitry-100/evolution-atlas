import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../lib/utils";

type SliderProps = SliderPrimitive.SliderProps;

export function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive.Root className={cn("slider-root", className)} {...props}>
      <SliderPrimitive.Track className="slider-track">
        <SliderPrimitive.Range className="slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="slider-thumb" aria-label="Позиция на временной шкале" />
    </SliderPrimitive.Root>
  );
}
