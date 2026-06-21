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

export const OptimizedImage = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(function OptimizedImage(
  { pictureClassName, preferOptimized = false, src, alt = "", onError, ...imageProps },
  ref,
) {
  const optimizedSrc = src ? getOptimizedImageSrc(src) : null;
  const [useOptimizedSource, setUseOptimizedSource] = useState(true);

  useEffect(() => {
    setUseOptimizedSource(true);
  }, [optimizedSrc]);

  if (!src || !preferOptimized || !optimizedSrc || !useOptimizedSource) {
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
        onError={() => setUseOptimizedSource(false)}
        {...imageProps}
      />
    </picture>
  );
});
