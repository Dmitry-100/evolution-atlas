import routeConfig from "../../config/public-routes.json";

export type PublicRoute = (typeof routeConfig)[number];

export const PUBLIC_ROUTES = routeConfig satisfies PublicRoute[];

export function publicRoutePath(key: string) {
  const route = PUBLIC_ROUTES.find((item) => item.key === key);
  if (!route) throw new Error(`Unknown public route: ${key}`);
  return route.path;
}

export function publicRouteTitle(pathname: string) {
  return (
    publicRouteForPath(pathname)?.labelRu ??
    PUBLIC_ROUTES[0].labelRu
  );
}

export function publicRouteForPath(pathname: string) {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const exactRoute = PUBLIC_ROUTES.find(
    (item) => item.path === normalizedPath,
  );

  if (exactRoute) return exactRoute;

  // Legacy material URLs are files rather than separately indexable pages.
  if (normalizedPath.startsWith("/materials/")) {
    return PUBLIC_ROUTES.find((item) => item.key === "materials");
  }

  return undefined;
}
