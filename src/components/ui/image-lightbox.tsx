import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { OptimizedImage } from "./optimized-image";

type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ImageLightboxProps = {
  image: LightboxImage | null;
  ariaLabel?: string;
  displayMode?: "fit" | "natural";
  onClose: () => void;
};

export function ImageLightbox({
  image,
  ariaLabel = "Увеличенное изображение",
  displayMode = "fit",
  onClose,
}: ImageLightboxProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!image) return undefined;

    const originalOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
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
        ref={panelRef}
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
    document.body,
  );
}
