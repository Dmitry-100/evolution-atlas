import { forwardRef, type ImgHTMLAttributes } from "react";
import { getOptimizedImageSrc } from "../../lib/imagePlaceholders";
import { getVersionedAssetSrc } from "../../lib/assetManifest";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  pictureClassName?: string;
};

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    { pictureClassName, src, alt = "", onError, ...imageProps },
    ref,
  ) {
    const optimizedSrc = src ? getOptimizedImageSrc(src) : null;
    const fallbackSrc = src ? getVersionedAssetSrc(src) : src;

    if (!src || !optimizedSrc) {
      return (
        <img
          ref={ref}
          src={fallbackSrc}
          alt={alt}
          onError={onError}
          {...imageProps}
        />
      );
    }

    return (
      <picture className={pictureClassName}>
        <source srcSet={getVersionedAssetSrc(optimizedSrc)} type="image/avif" />
        <img
          ref={ref}
          src={fallbackSrc}
          alt={alt}
          onError={onError}
          {...imageProps}
        />
      </picture>
    );
  },
);
