import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import { AppSurface } from "./App";
import { PUBLIC_ROUTES } from "./lib/publicRoutes";

/** Build-time snapshot of the real page. The client mounts a fresh interactive app. */
export async function renderPage(path: string) {
  if (!PUBLIC_ROUTES.some((route) => route.path === path)) {
    throw new Error(`Cannot prerender unknown route: ${path}`);
  }
  const page = (
    <StaticRouter location={path}>
      <div data-seo-prerender="full">
        <AppSurface />
        <noscript>
          <nav className="prerender-navigation" aria-label="Разделы атласа">
            {PUBLIC_ROUTES.map((route) => (
              <a key={route.path} href={route.path}>
                {route.labelRu}
              </a>
            ))}
          </nav>
        </noscript>
      </div>
    </StaticRouter>
  );
  let renderError: unknown;
  const { prelude } = await prerender(page, {
    signal: AbortSignal.timeout(30_000),
    // Inline even large Suspense boundaries; there is no streaming client.
    progressiveChunkSize: Number.MAX_SAFE_INTEGER,
    onError(error) {
      renderError = error;
    },
  });
  if (renderError) throw renderError;
  return new Response(prelude).text();
}
