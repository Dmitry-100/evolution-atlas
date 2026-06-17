import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";

export function TooltipProvider(props: TooltipPrimitive.TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />;
}

export function Tooltip(props: TooltipPrimitive.TooltipProps) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: TooltipPrimitive.TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({ className, ...props }: TooltipPrimitive.TooltipContentProps) {
  return <TooltipPrimitive.Content className={cn("tooltip-content", className)} sideOffset={8} {...props} />;
}
