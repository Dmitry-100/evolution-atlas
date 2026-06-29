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
} from "../../lib/tourUrlState";

const STORAGE_KEY = "evolution-atlas.active-tour";

function removeTourParams(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  params.delete("tour");
  params.delete("step");
  const nextSearch = params.toString();
  return `${pathname}${nextSearch ? `?${nextSearch}` : ""}`;
}

function fallbackPlanFromId(planId: string): TourPlan | null {
  const intent = inferTourIntentFromPlanId(planId);
  if (!intent || intent === "browse") return null;
  const fallback = buildTourRoute({ intent, budgetMin: 5 });
  return { ...fallback, planId };
}

function readStoredPlan(planId: string) {
  const snapshot = window.sessionStorage.getItem(STORAGE_KEY);
  return restoreStoredTourPlan(snapshot, planId) ?? fallbackPlanFromId(planId);
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
    () => (tourState ? readStoredPlan(tourState.planId) : null),
    [tourState],
  );

  const stepIndex =
    tourState && plan ? Math.min(tourState.stepIndex, plan.steps.length - 1) : 0;
  const step = plan?.steps[stepIndex] ?? null;
  const isLastStep = plan ? stepIndex >= plan.steps.length - 1 : false;

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
      const isNarrowViewport = window.matchMedia("(max-width: 720px)").matches;
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

  if (!tourState || !plan || !step || plan.steps.length === 0) return null;

  const activePlan = plan;
  const hasNextSteps = isLastStep && activePlan.nextSteps.length > 0;

  function goFree() {
    navigate(removeTourParams(location.pathname, location.search));
  }

  function changeRoute() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    navigate("/");
  }

  function goNext() {
    if (isLastStep) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      navigate(removeTourParams(location.pathname, location.search));
      return;
    }

    const nextStep = activePlan.steps[stepIndex + 1];
    navigate(hrefWithTourState(nextStep.href, {
      planId: activePlan.planId,
      stepIndex: stepIndex + 1,
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
          aria-label="Свернуть Дарвина"
          onClick={() => setIsCollapsed(true)}
        >
          <X aria-hidden="true" size={17} />
        </button>
      </header>

      <div className="tour-player-body">
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
        <button type="button" onClick={goFree}>
          Пойти самому
        </button>
        <button type="button" className="tour-next-button" onClick={goNext}>
          {isLastStep ? "Завершить" : "Дальше"}
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </footer>
    </aside>
  );
}
