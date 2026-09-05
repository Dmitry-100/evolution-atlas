import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { OptimizedImage } from "./optimized-image";
import { lockBodyScroll } from "../../lib/bodyScrollLock";

type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ImageLightboxProps = {
  image: LightboxImage | null;
  ariaLabel?: string;
  displayMode?: "fit" | "natural";
  portalTarget?: HTMLElement | null;
  onClose: () => void;
};

export function ImageLightbox({
  image,
  ariaLabel = "Увеличенное изображение",
  displayMode = "fit",
  portalTarget,
  onClose,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!image) return undefined;

    const unlockScroll = lockBodyScroll();
    const trigger = document.activeElement;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      // The close button is the dialog's only interactive control.
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    closeButtonRef.current?.focus({ preventScroll: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockScroll();
      document.removeEventListener("keydown", handleKeyDown);
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [image, onClose]);

  if (!image) return null;

  return createPortal(
    <div
      className={
        displayMode === "natural"
          ? "image-lightbox is-natural-size"
          : "image-lightbox"
      }
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div
        className="image-lightbox-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="image-lightbox-close"
          onClick={onClose}
          aria-label="Закрыть увеличенное изображение"
        >
          <X aria-hidden="true" size={20} />
        </button>
        <OptimizedImage src={image.src} alt={image.alt} decoding="async" />
        {image.caption ? <p>{image.caption}</p> : null}
      </div>
    </div>,
    portalTarget ?? document.body,
  );
}
