import "./Tour.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, MapPinned, RotateCcw, X } from "lucide-react";
import { buildTourRoute, type TourPlan } from "../../lib/buildTourRoute";
import {
  hrefWithTourState,
  inferTourIntentFromPlanId,
  parseTourUrlState,
  restoreStoredTourPlan,
  stripTourUrlState,
  type TourUrlState,
} from "../../lib/tourUrlState";

const STORAGE_KEY = "evolution-atlas.active-tour";
const TOUR_PARAM_NAMES = ["tour", "step", "intent", "budget"];

function fallbackPlanFromState(state: TourUrlState): TourPlan | null {
  const intent = state.intent ?? inferTourIntentFromPlanId(state.planId);
  if (!intent || intent === "browse") return null;
  const fallback = buildTourRoute({ intent, budgetMin: state.budgetMin ?? 5 });
  return { ...fallback, planId: state.planId };
}

function readStoredPlan(state: TourUrlState) {
  const snapshot = window.sessionStorage.getItem(STORAGE_KEY);
  const stored = restoreStoredTourPlan(snapshot, state.planId);
  if (stored) return { plan: stored, rebuilt: false };

  const fallback = fallbackPlanFromState(state);
  return fallback ? { plan: fallback, rebuilt: true } : null;
}

function escapedStopSelector(stopId: string) {
  const escape =
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape
      : (value: string) => value.replaceAll('"', '\\"');
  return `[data-tour-stop-id="${escape(stopId)}"]`;
}

function fallbackFocusSelector(kind: string) {
  return kind === "stage"
    ? ".stage-panel, .mobile-stage-row.is-active"
    : ".document-page, .quiz-page";
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function TourPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const playerRef = useRef<HTMLElement | null>(null);
  const tourState = useMemo(
    () => parseTourUrlState(location.search),
    [location.search],
  );
  const plan = useMemo(
    () => (tourState ? readStoredPlan(tourState) : null),
    [tourState],
  );

  const stepIndex =
    tourState && plan ? Math.min(tourState.stepIndex, plan.plan.steps.length - 1) : 0;
  const step = plan?.plan.steps[stepIndex] ?? null;
  const isLastStep = plan ? stepIndex >= plan.plan.steps.length - 1 : false;

  useEffect(() => {
    if (!step) return;

    const targets = [
      ...document.querySelectorAll<HTMLElement>(escapedStopSelector(step.id)),
    ];
    const focusTargets =
      targets.length > 0
        ? targets
        : [
            ...document.querySelectorAll<HTMLElement>(
              fallbackFocusSelector(step.kind),
            ),
          ];

    const focusLabel = step.kind === "stage" ? "Текущая остановка" : "Смотрите сюда";
    focusTargets.forEach((target) => {
      target.classList.add("tour-focus-target");
      target.dataset.tourFocusLabel = focusLabel;
    });
    const firstTarget =
      focusTargets.find((target) => !target.matches(".deep-stage-dot")) ??
      focusTargets[0];
    const firstRect = firstTarget?.getBoundingClientRect();
    playerRef.current?.classList.toggle(
      "tour-player--right",
      Boolean(
        firstRect &&
          firstRect.left + firstRect.width / 2 < window.innerWidth / 2,
      ),
    );
    const scrollFrame = window.requestAnimationFrame(() => {
      const isNarrowViewport = window.matchMedia("(max-width: 640px)").matches;
      const block = isNarrowViewport || firstTarget?.matches(".document-page, .quiz-page")
        ? "start"
        : "center";
      firstTarget?.scrollIntoView({ block, behavior: "smooth" });
    });

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      focusTargets.forEach((target) => {
        target.classList.remove("tour-focus-target");
        delete target.dataset.tourFocusLabel;
      });
    };
  }, [step]);

  useEffect(() => {
    if (tourState) return;
    const params = new URLSearchParams(location.search);
    const hasBrokenTourParams = TOUR_PARAM_NAMES.some((name) => params.has(name));
    if (!hasBrokenTourParams) return;

    navigate(stripTourUrlState(location.pathname, location.search), {
      replace: true,
    });
  }, [location.pathname, location.search, navigate, tourState]);

  if (!tourState || !plan || !step || plan.plan.steps.length === 0) return null;

  const activePlan = plan.plan;
  const hasNextSteps = isLastStep && activePlan.nextSteps.length > 0;

  function changeRoute() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    navigate("/");
  }

  function goNext() {
    if (isLastStep) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      navigate(stripTourUrlState(location.pathname, location.search));
      return;
    }

    const nextStep = activePlan.steps[stepIndex + 1];
    navigate(hrefWithTourState(nextStep.href, {
      planId: activePlan.planId,
      stepIndex: stepIndex + 1,
      intent: activePlan.intent,
      budgetMin: activePlan.budgetMin ?? null,
    }));
  }

  function goPrevious() {
    if (stepIndex <= 0) return;

    const previousStep = activePlan.steps[stepIndex - 1];
    navigate(hrefWithTourState(previousStep.href, {
      planId: activePlan.planId,
      stepIndex: stepIndex - 1,
      intent: activePlan.intent,
      budgetMin: activePlan.budgetMin ?? null,
    }));
  }

  if (isCollapsed) {
    return (
      <aside className="tour-player tour-player-collapsed" aria-label="Тур Дарвина">
        <button type="button" onClick={() => setIsCollapsed(false)}>
          <MapPinned aria-hidden="true" size={17} />
          Показать тур Дарвина
        </button>
      </aside>
    );
  }

  return (
    <aside
      ref={playerRef}
      className={hasNextSteps ? "tour-player tour-player--with-next-steps" : "tour-player"}
      aria-label="Тур Дарвина"
    >
      <header>
        <div>
          <span>
            Шаг {stepIndex + 1} из {activePlan.steps.length}
          </span>
          <h2>{activePlan.routeTitleRu}</h2>
        </div>
        <button
          type="button"
          className="tour-icon-button"
          aria-label="Без Дарвина"
          onClick={() => setIsCollapsed(true)}
        >
          <X aria-hidden="true" size={17} />
        </button>
      </header>

      <div className="tour-player-body">
        {plan.rebuilt ? (
          <p className="tour-rebuilt-note" role="status">
            Маршрут восстановлен из ссылки: персональные формулировки могли
            быть собраны заново.
          </p>
        ) : null}
        <strong>{step.titleRu}</strong>
        <p>{step.narrationRu}</p>
        <section className="tour-guide-note">
          <h3>Заметка гида</h3>
          <p>{step.revealRu}</p>
        </section>
        {hasNextSteps ? (
          <section className="tour-next-steps" aria-labelledby="tour-next-steps-title">
            <div>
              <h3 id="tour-next-steps-title">Куда пойти дальше</h3>
              <p>{activePlan.outroRu}</p>
            </div>
            <div className="tour-next-step-grid">
              {activePlan.nextSteps.map((nextStep) => (
                <a
                  key={`${nextStep.href}-${nextStep.labelRu}`}
                  className="tour-next-step-card"
                  href={nextStep.href}
                  target={isExternalHref(nextStep.href) ? "_blank" : undefined}
                  rel={isExternalHref(nextStep.href) ? "noreferrer" : undefined}
                >
                  <span>{nextStep.labelRu}</span>
                  <small>{nextStep.descriptionRu}</small>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer>
        <button type="button" onClick={changeRoute}>
          <RotateCcw aria-hidden="true" size={16} />
          Сменить маршрут
        </button>
        <button type="button" onClick={goPrevious} disabled={stepIndex <= 0}>
          Назад
        </button>
        <button type="button" className="tour-next-button" onClick={goNext}>
          {isLastStep ? "Завершить" : "Дальше"}
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </footer>
    </aside>
  );
}
