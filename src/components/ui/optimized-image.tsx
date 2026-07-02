import {
  forwardRef,
  useEffect,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { getOptimizedImageSrc } from "../../lib/imagePlaceholders";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  alt: string;
  pictureClassName?: string;
  /**
   * Deprecated: optimized delivery is the default. Keep the prop only so older
   * call-sites do not break during migration.
   */
  preferOptimized?: boolean;
};

const optimizedImageDeliveryEnabled =
  import.meta.env.VITE_ENABLE_OPTIMIZED_IMAGES !== "false";

export const OptimizedImage = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(function OptimizedImage(
  {
    pictureClassName,
    preferOptimized: _deprecatedPreferOptimized,
    src,
    alt,
    onError,
    ...imageProps
  },
  ref,
) {
  void _deprecatedPreferOptimized;

  const optimizedSrc = src ? getOptimizedImageSrc(src) : null;
  const [useOptimizedSource, setUseOptimizedSource] = useState(true);
  const shouldUseOptimizedSource =
    optimizedImageDeliveryEnabled &&
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
      <source
        srcSet={optimizedSrc}
        sizes={imageProps.sizes}
        type="image/avif"
      />
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
