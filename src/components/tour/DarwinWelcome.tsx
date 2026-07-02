import "./Tour.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Baby,
  BookOpenCheck,
  Compass,
  Dna,
  FlaskConical,
  HelpCircle,
  Loader2,
  Map,
  X,
} from "lucide-react";
import {
  GUIDED_TOUR_INTENTS,
  type TourBudgetMin,
  type TourIntent,
} from "../../data/guidedTour";
import { buildTourRoute, type TourPlan } from "../../lib/buildTourRoute";
import {
  createStoredTourPlanSnapshot,
  hrefWithTourState,
} from "../../lib/tourUrlState";
import type { PlanTourRequest, PlanTourResult } from "../../lib/planTourHandler";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout";

const STORAGE_KEY = "evolution-atlas.active-tour";
export const DARWIN_TOUR_MENU_EVENT = "evolution-atlas:open-tour-guide";

const intentIcons = {
  overview: Compass,
  skeptical: HelpCircle,
  ancestors: Dna,
  child: Baby,
  origin: FlaskConical,
  dinosaurs: Dna,
  presenter: BookOpenCheck,
  browse: Map,
  custom: HelpCircle,
} satisfies Record<TourIntent, typeof HelpCircle>;

const WELCOME_INTENTS = GUIDED_TOUR_INTENTS.filter(
  (intent) => intent.id !== "custom",
);

function getApiUrl() {
  const baseUrl = import.meta.env.VITE_AI_API_BASE_URL?.replace(/\/$/, "");
  return `${baseUrl ?? ""}/api/plan-tour`;
}

function storePlan(plan: TourPlan) {
  window.sessionStorage.setItem(STORAGE_KEY, createStoredTourPlanSnapshot(plan));
}

async function requestTourPlan(request: PlanTourRequest, fallback: TourPlan) {
  try {
    const response = await fetchWithTimeout(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      timeoutMs: 9_000,
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error("Plan tour endpoint failed");

    const result = (await response.json()) as PlanTourResult;
    return result.ok ? result.data : fallback;
  } catch {
    return fallback;
  }
}

type DarwinWelcomePhase = "intent" | "age" | "budget" | "custom" | "browse";

type DarwinWelcomeProps = {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onTourStart?: () => void;
};

export function DarwinWelcome({
  isOpen,
  onOpenChange,
  onTourStart,
}: DarwinWelcomeProps = {}) {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [phase, setPhase] = useState<DarwinWelcomePhase>("intent");
  const [selectedIntent, setSelectedIntent] = useState<TourIntent | null>(null);
  const [childAge, setChildAge] = useState<number | null>(null);
  const [freeText, setFreeText] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const browsePlan = buildTourRoute({ intent: "browse" });
  const routePreview =
    selectedIntent && selectedIntent !== "browse"
      ? buildTourRoute({
          intent: selectedIntent,
          budgetMin: 5,
          childAge,
          freeText: freeText.trim() || undefined,
        })
      : null;
  const open = isOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (isOpen === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isOpen, onOpenChange],
  );

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [phase, selectedIntent, childAge]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, setOpen]);

  function chooseIntent(intent: TourIntent) {
    setSelectedIntent(intent);
    if (intent === "browse") {
      setPhase("browse");
      return;
    }
    if (intent === "child") {
      setPhase("age");
      return;
    }
    if (intent === "custom") {
      setPhase("custom");
      return;
    }
    setPhase("budget");
  }

  async function startTour(budgetMin: TourBudgetMin) {
    if (!selectedIntent || isStarting) return;
    const answers = {
      intent: selectedIntent,
      budgetMin,
      childAge,
      freeText: freeText.trim() || undefined,
    };
    const fallback = buildTourRoute(answers);
    if (fallback.steps.length === 0) return;
    setIsStarting(true);

    const plan = await requestTourPlan(
      {
        ...answers,
        allowedStops: fallback.steps.map(({ id, titleRu, hintRu }) => ({
          id,
          titleRu,
          hintRu,
        })),
      },
      fallback,
    );
    storePlan(plan);
    setOpen(false);
    onTourStart?.();
    setIsStarting(false);
    navigate(hrefWithTourState(plan.steps[0].href, {
      planId: plan.planId,
      stepIndex: 0,
      intent: answers.intent,
      budgetMin,
    }));
  }

  function resetChoice() {
    setPhase("intent");
    setSelectedIntent(null);
    setChildAge(null);
    setFreeText("");
  }

  return (
    <div className="darwin-welcome-shell">
      <button
        type="button"
        className="darwin-welcome-trigger"
        aria-label="Открыть экскурсию с Дарвином"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Compass aria-hidden="true" size={18} />
        <span>Экскурсия</span>
        <strong>с Дарвином</strong>
      </button>

      {open ? (
        <section
          ref={panelRef}
          className="darwin-welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Дарвин встречает посетителя"
        >
          <div className="darwin-welcome-copy">
            <p className="kicker">Персональный гид</p>
            <h2>
              Здравствуйте. Я Дарвин. Сегодня я ваш проводник по дереву жизни.
            </h2>
            <p>
              В этой прогулке не нужно сразу помнить все эпохи и названия.
              Выберите, с какого любопытства начать, а я проведу вас по
              связанному маршруту.
            </p>
          </div>

          {phase === "intent" ? (
            <>
              <div className="darwin-intent-grid">
                {WELCOME_INTENTS.map((intent) => {
                  const Icon = intentIcons[intent.id];

                  return (
                    <button
                      key={intent.id}
                      type="button"
                      className="darwin-intent-button"
                      onClick={() => chooseIntent(intent.id)}
                    >
                      <Icon aria-hidden="true" size={18} />
                      <span>{intent.labelRu}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {phase === "age" ? (
            <div className="darwin-followup-panel">
              <h3>Сколько лет ребенку?</h3>
              <p>
                От возраста зависит язык: один и тот же маршрут можно рассказать
                как сказку, прогулку или школьное объяснение.
              </p>
              <div className="darwin-choice-row">
                {[6, 8, 10, 12].map((age) => (
                  <button
                    key={age}
                    type="button"
                    className={childAge === age ? "is-selected" : ""}
                    onClick={() => {
                      setChildAge(age);
                      setPhase("budget");
                    }}
                  >
                    {age} лет
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {phase === "custom" ? (
            <div className="darwin-followup-panel">
              <label htmlFor="darwin-custom-interest">Что вас зацепило?</label>
              <textarea
                id="darwin-custom-interest"
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
                placeholder="Например: хочу понять ДНК, динозавров или почему обезьяны не становятся людьми"
                rows={3}
              />
              <button
                type="button"
                className="button button-secondary button-sm"
                disabled={freeText.trim().length < 3}
                onClick={() => setPhase("budget")}
              >
                Подобрать маршрут
              </button>
            </div>
          ) : null}

          {phase === "budget" ? (
            <div className="darwin-followup-panel darwin-route-preview">
              <div className="darwin-route-summary">
                <p className="kicker">Что будет в этой экскурсии</p>
                <h3>{routePreview?.routeTitleRu}</h3>
                <p>{routePreview?.pitchRu}</p>
              </div>

              <section className="darwin-route-facts" aria-label="Интересные факты по пути">
                <h4>Интересные факты по пути</h4>
                <ul>
                  {routePreview?.factsRu.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </section>

              <p className="darwin-route-length-copy">
                Можно выбрать базовый маршрут на 8 остановок или полную
                экскурсию на 15 остановок. Если это не то любопытство, вернитесь
                к списку и найдите другую экскурсию.
              </p>

              <h3>Выбрать базовый маршрут или полную экскурсию?</h3>
              <div className="darwin-choice-row">
                <button type="button" onClick={() => void startTour(5)}>
                  {isStarting ? (
                    <Loader2 aria-hidden="true" size={16} />
                  ) : (
                    <Compass aria-hidden="true" size={16} />
                  )}
                  Базовый маршрут - 8 остановок
                </button>
                <button type="button" onClick={() => void startTour(15)}>
                  {isStarting ? (
                    <Loader2 aria-hidden="true" size={16} />
                  ) : (
                    <BookOpenCheck aria-hidden="true" size={16} />
                  )}
                  Полная экскурсия - 15 остановок
                </button>
              </div>
            </div>
          ) : null}

          {phase === "browse" ? (
            <div className="darwin-followup-panel">
              <h3>{browsePlan.routeTitleRu}</h3>
              <p>{browsePlan.introRu}</p>
              <div className="darwin-browse-links">
                {browsePlan.browseLinks?.map((link) => (
                  <Link key={link.href} to={link.href} aria-label={link.labelRu}>
                    <span>{link.labelRu}</span>
                    <small>{link.descriptionRu}</small>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="darwin-welcome-actions">
            {phase !== "intent" ? (
            <button type="button" onClick={resetChoice}>
                Сменить выбор и найти другую экскурсию
              </button>
            ) : null}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" size={15} />
              Без Дарвина
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
