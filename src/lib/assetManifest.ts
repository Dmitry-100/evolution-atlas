declare const __ASSET_MANIFEST__: Readonly<Record<string, string>>;

export function getVersionedAssetSrc(src: string) {
  return __ASSET_MANIFEST__[src] ?? src;
}
