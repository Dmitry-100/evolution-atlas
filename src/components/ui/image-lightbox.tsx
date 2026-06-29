import { useEffect } from "react";
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
  onClose: () => void;
};

export function ImageLightbox({
  image,
  ariaLabel = "Увеличенное изображение",
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!image) return undefined;

    const originalOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return createPortal(
    <div
      className="image-lightbox"
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
