import {
  forwardRef,
  useEffect,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { getOptimizedImageSrc } from "../../lib/imagePlaceholders";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  pictureClassName?: string;
  preferOptimized?: boolean;
};

const optimizedImageDeliveryEnabled =
  import.meta.env.VITE_ENABLE_OPTIMIZED_IMAGES === "true";

export const OptimizedImage = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(function OptimizedImage(
  { pictureClassName, preferOptimized = false, src, alt = "", onError, ...imageProps },
  ref,
) {
  const optimizedSrc = src ? getOptimizedImageSrc(src) : null;
  const [useOptimizedSource, setUseOptimizedSource] = useState(true);
  const shouldUseOptimizedSource =
    optimizedImageDeliveryEnabled &&
    preferOptimized &&
    optimizedSrc &&
    useOptimizedSource;

  useEffect(() => {
    setUseOptimizedSource(true);
  }, [optimizedSrc]);

  if (!src || !shouldUseOptimizedSource) {
    return (
      <img ref={ref} src={src} alt={alt} onError={onError} {...imageProps} />
    );
  }

  return (
    <picture className={pictureClassName}>
      <source srcSet={optimizedSrc} type="image/avif" />
      <img
        ref={ref}
        src={src}
        alt={alt}
        onError={(event) => {
          setUseOptimizedSource(false);
          onError?.(event);
        }}
        {...imageProps}
      />
    </picture>
  );
});
