import { useId, useRef, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function GameDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
  alert = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  alert?: boolean;
}) {
  const descriptionId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="game-dialog-overlay" />
        <Dialog.Content
          className={`game-dialog ${className}`}
          role={alert ? "alertdialog" : "dialog"}
          aria-describedby={description ? descriptionId : undefined}
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus({ preventScroll: true });
          }}
        >
          <div className="game-dialog-heading">
            <div>
              <span className="game-eyebrow">Полевой дневник</span>
              <Dialog.Title>{title}</Dialog.Title>
            </div>
            <Dialog.Close className="game-icon-button" aria-label="Закрыть">
              <X size={20} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description id={descriptionId}>
              {description}
            </Dialog.Description>
          )}
          <div className="game-dialog-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
