import { SITE_ORIGIN } from "./seo";

type MetrikaFunction = {
  (...args: unknown[]): void;
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: MetrikaFunction;
  }
}

export type AnalyticsGoalParams = {
  game_started: { version: number };
  game_first_turn_completed: { version: number };
  game_crisis_reached: { turn: number; survived: boolean };
  game_finished: { turn: number; outcome: "won" | "extinct"; population: number };
  game_restarted: { sameScenario: boolean };
  game_article_opened: { route: string; turn: number };
  darwin_opened: { route: string };
  darwin_answered: {
    route: string;
    outcome: "success" | "error";
    grounding?: "site" | "external";
    confidence?: "solid" | "likely" | "debated";
  };
  tour_builder_opened: { route: string };
  tour_started: {
    intent: string;
    budget: number;
    source: "ai" | "preset";
    stops: number;
  };
  tour_completed: { source: "ai" | "preset"; stops: number };
  quiz_started: { questions: number };
  quiz_completed: { correct: number; total: number };
  material_opened: { route: string; format: "pdf" | "image" | "download" };
  external_link_opened: { route: string; host: string };
};

export type AnalyticsGoal = keyof AnalyticsGoalParams;

export function parseMetrikaCounterId(rawValue: string | undefined) {
  if (!rawValue || !/^\d+$/.test(rawValue)) return undefined;
  const counterId = Number(rawValue);
  return Number.isSafeInteger(counterId) && counterId > 0
    ? counterId
    : undefined;
}

const counterId = parseMetrikaCounterId(
  import.meta.env.VITE_YANDEX_METRIKA_ID,
);
let previousPageUrl: string | undefined;

export function isAnalyticsOriginAllowed(
  currentOrigin: string,
  allowLocal = false,
) {
  return currentOrigin === SITE_ORIGIN || allowLocal;
}

function safeRoute(pathname: string) {
  return pathname.startsWith("/") ? pathname.slice(0, 120) : "/";
}

export function initializeAnalytics() {
  if (!counterId || typeof window === "undefined") return false;
  if (
    !isAnalyticsOriginAllowed(
      window.location.origin,
      import.meta.env.VITE_YANDEX_METRIKA_ALLOW_LOCAL === "true",
    )
  ) {
    return false;
  }

  if (!window.ym) {
    const queuedMetrika: MetrikaFunction = (...args: unknown[]) => {
      queuedMetrika.a = queuedMetrika.a ?? [];
      queuedMetrika.a.push(args);
    };
    queuedMetrika.l = Date.now();
    window.ym = queuedMetrika;
  }

  if (!document.querySelector('script[data-analytics="yandex-metrika"]')) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    script.dataset.analytics = "yandex-metrika";
    document.head.append(script);
  }

  window.ym(counterId, "init", {
    accurateTrackBounce: true,
    clickmap: true,
    defer: true,
    trackLinks: true,
    webvisor: import.meta.env.VITE_YANDEX_METRIKA_WEBVISOR === "true",
  });
  return true;
}

export function trackPageView(pathname: string, title: string) {
  if (!counterId || !window.ym) return;
  const pageUrl = new URL(safeRoute(pathname), SITE_ORIGIN).href;
  window.ym(counterId, "hit", pageUrl, {
    title,
    ...(previousPageUrl ? { referer: previousPageUrl } : {}),
  });
  previousPageUrl = pageUrl;
}

export function trackGoal<Goal extends AnalyticsGoal>(
  goal: Goal,
  params: AnalyticsGoalParams[Goal],
) {
  if (!counterId || !window.ym) return;
  window.ym(counterId, "reachGoal", goal, params);
}

export function trackSafeLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

  const target = new URL(href, window.location.href);
  const route = safeRoute(window.location.pathname);
  const isDownload = anchor.hasAttribute("download");
  const isMaterial = target.pathname.startsWith("/assets/materials/");

  if (isDownload || isMaterial) {
    const format = target.pathname.endsWith(".pdf")
      ? "pdf"
      : isDownload
        ? "download"
        : "image";
    trackGoal("material_opened", { route, format });
    return;
  }

  if (target.origin !== window.location.origin) {
    trackGoal("external_link_opened", {
      route,
      host: target.hostname.slice(0, 120),
    });
  }
}
