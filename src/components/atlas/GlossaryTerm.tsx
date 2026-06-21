import type { ReactNode } from "react";
import type { GlossaryTerm as GlossaryTermData } from "../../data/glossary";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type GlossaryTermProps = {
  term: GlossaryTermData;
  children?: ReactNode;
};

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="glossary-term" type="button">
          {children ?? term.titleRu}
        </button>
      </TooltipTrigger>
      <TooltipContent className="glossary-tooltip">
        <strong>{term.titleRu}</strong>
        {term.latin ? <em>{term.latin}</em> : null}
        <span>{term.definitionRu}</span>
        <small>{term.exampleRu}</small>
      </TooltipContent>
    </Tooltip>
  );
}
