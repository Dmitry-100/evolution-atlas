import { forwardRef, type ImgHTMLAttributes } from "react";
import { getVersionedAssetSrc } from "../../lib/assetManifest";

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  pictureClassName?: string;
};

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    { pictureClassName, src, alt = "", onError, ...imageProps },
    ref,
  ) {
    const fallbackSrc = src ? getVersionedAssetSrc(src) : src;
    const image = (
      <img
        ref={ref}
        src={fallbackSrc}
        alt={alt}
        onError={onError}
        {...imageProps}
      />
    );

    if (pictureClassName) {
      return <picture className={pictureClassName}>{image}</picture>;
    }

    return image;
  },
);
