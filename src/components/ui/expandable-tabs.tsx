"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "../../lib/utils";

interface Tab {
  title: string;
  icon: LucideIcon;
  href?: string;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  href?: never;
}

export type ExpandableTabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: ExpandableTabItem[];
  className?: string;
  activeColor?: string;
  selectedIndex?: number | null;
  collapsible?: boolean;
  onChange?: (index: number | null) => void;
  onIntent?: (index: number) => void;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor,
  selectedIndex,
  collapsible = true,
  onChange,
  onIntent,
}: ExpandableTabsProps) {
  const [internalSelected, setInternalSelected] = React.useState<number | null>(
    null,
  );
  const selected = selectedIndex === undefined ? internalSelected : selectedIndex;
  const outsideClickRef = React.useRef<HTMLDivElement>(null!);

  useOnClickOutside(outsideClickRef, () => {
    if (!collapsible) return;
    if (selectedIndex === undefined) setInternalSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    if (selectedIndex === undefined) setInternalSelected(index);
    onChange?.(index);
  };

  return (
    <div
      ref={outsideClickRef}
      className={cn("expandable-tabs", className)}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="expandable-tabs-separator"
              aria-hidden="true"
            />
          );
        }

        const Icon = tab.icon;
        const isSelected = selected === index;
        const classNames = cn(
          "expandable-tab",
          isSelected ? cn("is-selected", activeColor) : "is-idle",
        );
        const content = (
          <>
            <Icon aria-hidden="true" size={20} />
            <span className="expandable-tab-sr">{tab.title}</span>
            <span className="expandable-tab-label" aria-hidden={!isSelected}>
              {tab.title}
            </span>
            <span className="expandable-tab-mobile-label" aria-hidden="true">
              {tab.title}
            </span>
          </>
        );
        if (tab.href) {
          return (
            <a
              key={tab.title}
              href={tab.href}
              aria-current={isSelected ? "page" : undefined}
              aria-label={tab.title}
              title={tab.title}
              className={classNames}
              onClick={(event) => {
                if (
                  event.button !== 0 ||
                  event.metaKey ||
                  event.altKey ||
                  event.ctrlKey ||
                  event.shiftKey
                ) {
                  return;
                }

                event.preventDefault();
                handleSelect(index);
              }}
              onFocus={() => onIntent?.(index)}
              onMouseEnter={() => onIntent?.(index)}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={tab.title}
            type="button"
            aria-pressed={isSelected}
            aria-label={tab.title}
            title={tab.title}
            className={classNames}
            onClick={() => handleSelect(index)}
            onFocus={() => onIntent?.(index)}
            onMouseEnter={() => onIntent?.(index)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
