import { useEffect, useState } from "react";

type MatchMediaLike = Window["matchMedia"] | undefined;

export function getInitialMediaQueryMatch(
  query: string,
  matchMedia: MatchMediaLike =
    typeof window === "undefined" ? undefined : window.matchMedia,
) {
  return matchMedia?.(query).matches ?? false;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getInitialMediaQueryMatch(query));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
