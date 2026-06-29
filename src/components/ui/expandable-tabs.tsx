"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
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

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".58rem",
    paddingRight: ".58rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".58rem",
    paddingRight: isSelected ? "1rem" : ".58rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition: Transition = {
  delay: 0.06,
  type: "spring",
  bounce: 0,
  duration: 0.5,
};

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
            {!isSelected ? (
              <span className="expandable-tab-sr">{tab.title}</span>
            ) : null}
            <AnimatePresence initial={false}>
              {isSelected ? (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="expandable-tab-label"
                >
                  {tab.title}
                </motion.span>
              ) : null}
            </AnimatePresence>
            <span className="expandable-tab-mobile-label" aria-hidden="true">
              {tab.title}
            </span>
          </>
        );

        if (tab.href) {
          return (
            <motion.a
              key={tab.title}
              href={tab.href}
              aria-current={isSelected ? "page" : undefined}
              aria-label={tab.title}
              variants={buttonVariants}
              initial={false}
              animate="animate"
              custom={isSelected}
              transition={transition}
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
            </motion.a>
          );
        }

        return (
          <motion.button
            key={tab.title}
            type="button"
            aria-pressed={isSelected}
            aria-label={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isSelected}
            transition={transition}
            className={classNames}
            onClick={() => handleSelect(index)}
            onFocus={() => onIntent?.(index)}
            onMouseEnter={() => onIntent?.(index)}
          >
            {content}
          </motion.button>
        );
      })}
    </div>
  );
}
