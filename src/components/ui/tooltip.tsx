import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export function TooltipProvider(props: TooltipPrimitive.TooltipProviderProps) {
  return <TooltipPrimitive.Provider {...props} />;
}

export function Tooltip(props: TooltipPrimitive.TooltipProps) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: TooltipPrimitive.TooltipTriggerProps) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent(props: TooltipPrimitive.TooltipContentProps) {
  return <TooltipPrimitive.Content className="tooltip-content" sideOffset={8} {...props} />;
}
