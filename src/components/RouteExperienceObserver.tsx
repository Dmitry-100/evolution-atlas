import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, trackSafeLink } from "../lib/analytics";
import { applyRouteSeo } from "../lib/seo";

export function RouteExperienceObserver() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const route = applyRouteSeo(location.pathname);
    if (route && lastTrackedPath.current !== route.path) {
      trackPageView(route.path, route.seoTitle);
      lastTrackedPath.current = route.path;
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleLinkClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) trackSafeLink(anchor);
    }

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  return null;
}
