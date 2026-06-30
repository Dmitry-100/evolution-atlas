import { useState, type ReactNode } from "react";
import {
  getGlossaryTerm,
  type GlossaryTerm as GlossaryTermData,
} from "../../data/glossary";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type GlossaryTermProps = {
  term: GlossaryTermData;
  children?: ReactNode;
};

type GlossaryTermByIdProps = {
  id: string;
  children?: ReactNode;
};

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <button
          className="glossary-term"
          type="button"
          onBlur={() => setIsOpen(false)}
          onClick={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        >
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

export function GlossaryTermById({ id, children }: GlossaryTermByIdProps) {
  const term = getGlossaryTerm(id);

  if (!term) {
    return <>{children ?? id}</>;
  }

  return <GlossaryTerm term={term}>{children}</GlossaryTerm>;
}
