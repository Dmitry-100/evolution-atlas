import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/dinosaurs.css";
import {
  ArrowLeft,
  ArrowRight,
  Bird,
  ChevronDown,
  Clock3,
  ExternalLink,
  Feather,
  Fingerprint,
  GitBranch,
  Star,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { StageDetailCard } from "../components/atlas/StageDetailCard";
import { MobileStageDetail } from "../components/atlas/mobile/MobileStageDetail";
import { ConstellationField } from "../components/ui/constellation-field";
import { FloatingPaths } from "../components/ui/floating-paths";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import { Slider } from "../components/ui/slider";
import { CURIOSITY_FACTS } from "../data/curiosityFacts";
import {
  birdDinosaurBranch,
  dinosaurCommonAncestor,
  dinosaurAnswer,
  sharedAnimalBranch,
  type DinosaurLineageStage,
} from "../data/dinosaurLineage";
import type { EvolutionStage, StageImage } from "../data/lineage";
import { useMediaQuery } from "../hooks/useMediaQuery";

type BranchItem = EvolutionStage | DinosaurLineageStage;

const dinosaurJourney: BranchItem[] = [
  ...sharedAnimalBranch,
  ...birdDinosaurBranch,
];
const dinosaurJourneyZones = [
  {
    id: "shared",
    label: "Общая линия позвоночных",
    color: "#82b7b3",
    fromId: "early-animals",
    toId: "amniotes",
  },
  {
    id: "birds",
    label: "От динозавров к птицам",
    color: "#d0a35b",
    fromId: "diapsids",
    toId: "modern-birds",
  },
];

const timelineTicks = [
  "575 млн",
  "430 млн",
  "300 млн",
  "230 млн",
  "150 млн",
  "66 млн",
  "сегодня",
];

const dinosaurRouteStops = [
  {
    id: "shared",
    label: "Животные",
    targetId: "early-animals",
    range: "575-320 млн лет",
    color: "#6aa8ad",
  },
  {
    id: "amniotes",
    label: "Амниоты",
    targetId: "amniotes",
    range: "320 млн лет",
    color: "#d0a35b",
  },
  {
    id: "diapsids",
    label: "Диапсиды",
    targetId: "diapsids",
    range: "310 млн лет",
    color: "#98ad70",
  },
  {
    id: "archosaurs",
    label: "Архозавры",
    targetId: "archosaurs",
    range: "250 млн лет",
    color: "#d28c59",
  },
  {
    id: "dinosaurs",
    label: "Динозавры",
    targetId: "early-dinosaurs",
    range: "230-160 млн лет",
    color: "#c7794d",
  },
  {
    id: "birds",
    label: "Птицы",
    targetId: "archaeopteryx",
    range: "150-66 млн лет",
    color: "#e4c06c",
  },
];

const dinosaurMilestones = [
  {
    id: "amniotes",
    label: "Общий предок",
    icon: GitBranch,
    value: "~320",
    text: "млн лет назад",
    date: "~320 млн лет",
    note: "Развилка двух линий",
  },
  {
    id: "early-dinosaurs",
    label: "Ранние динозавры",
    icon: Fingerprint,
    value: "~230",
    text: "млн лет назад",
    date: "~230 млн лет",
    note: "До археоптерикса — ~80 млн лет",
  },
  {
    id: "archaeopteryx",
    label: "Археоптерикс",
    icon: Feather,
    value: "~150",
    text: "млн лет назад",
    date: "~150 млн лет",
    note: "Перья и крылья",
  },
  {
    id: "kpg-survivors",
    label: "Рубеж K–Pg",
    icon: Clock3,
    value: "66",
    text: "млн лет назад",
    date: "66 млн лет",
    note: "~165 млн лет после первых динозавров",
  },
  {
    id: "modern-birds",
    label: "Современные птицы",
    icon: Bird,
    value: "10 000+",
    text: "видов живут сегодня",
    date: "Сегодня",
    note: "Более 10 000 видов",
  },
].map((milestone) => ({
  ...milestone,
  stageIndex: dinosaurJourney.findIndex((stage) => stage.id === milestone.id),
}));

const featherFact = CURIOSITY_FACTS.find(
  (fact) => fact.id === "feathers-before-flight",
)!;
const featheredDinosaur = birdDinosaurBranch.find(
  (stage) => stage.id === "feathered-dinosaurs",
)!;

const formatAge = (ageMa: number) => {
  if (ageMa === 0) {
    return "сегодня";
  }
  return `${ageMa.toLocaleString("ru-RU")} млн лет назад`;
};

const getEvidence = (stage: BranchItem) =>
  "evidenceRu" in stage ? stage.evidenceRu : null;
function agePosition(stages: BranchItem[], ageMa: number) {
  const ages = stages.map((stage) => stage.ageMa);
  const oldest = Math.max(...ages);
  const youngest = Math.min(...ages);
  if (oldest === youngest) return 50;
  return ((oldest - ageMa) / (oldest - youngest)) * 100;
}

function nearestStageByPosition(
  stages: BranchItem[],
  positions: number[],
  target: number,
) {
  return stages.reduce<{ stage: BranchItem; distance: number } | null>(
    (nearest, stage, index) => {
      const position = (positions[index] ?? 0) / 100;
      const distance = Math.abs(position - target);
      if (!nearest || distance < nearest.distance) return { stage, distance };
      return nearest;
    },
    null,
  )?.stage;
}

function makeReadablePositions(stages: BranchItem[]) {
  const raw = stages.map((stage) =>
    Math.max(4, Math.min(96, agePosition(stages, stage.ageMa))),
  );
  const minimumGap = 4.85;
  const positions = raw.map((position) => position);

  for (let index = 1; index < positions.length; index += 1) {
    positions[index] = Math.max(
      positions[index],
      positions[index - 1] + minimumGap,
    );
  }

  if ((positions[positions.length - 1] ?? 0) > 96) {
    positions[positions.length - 1] = 96;
    for (let index = positions.length - 2; index >= 0; index -= 1) {
      positions[index] = Math.min(
        positions[index],
        positions[index + 1] - minimumGap,
      );
    }
  }

  return positions.map((position) => Math.max(4, Math.min(96, position)));
}

function getStepTarget(stages: BranchItem[], activeId: string, delta: number) {
  const fallback = stages[0];
  if (!fallback) {
    throw new Error("Dinosaur branch cannot be empty");
  }

  const currentIndex = stages.findIndex((stage) => stage.id === activeId);
  const nextIndex = Math.min(
    Math.max(currentIndex + delta, 0),
    stages.length - 1,
  );
  return stages[nextIndex] ?? fallback;
}

function DinosaurIllustration({
  image,
  title,
  className = "",
  zoomClassName = "",
}: {
  image: StageImage;
  title: string;
  className?: string;
  zoomClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <figure className={className}>
        <button
          type="button"
          className={`dinosaur-image-zoom ${zoomClassName}`}
          aria-label={`Увеличить изображение: ${title}`}
          onClick={() => setExpanded(true)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.altRu}
            loading="lazy"
            decoding="async"
          />
        </button>
        <figcaption>
          {image.kind === "generated-reconstruction"
            ? "AI-реконструкция"
            : image.credit}
        </figcaption>
      </figure>
      <ImageLightbox
        image={
          expanded
            ? {
                src: image.src,
                alt: image.altRu,
                caption: `${title}. ${image.altRu}`,
              }
            : null
        }
        ariaLabel="Увеличенное изображение вида"
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

function DinosaurEvidence({ stage }: { stage: BranchItem }) {
  const evidence = getEvidence(stage);
  return (
    <details className="dinosaur-evidence">
      <summary>
        <span>На чём основан вывод</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      {evidence && <p>{evidence}</p>}
      <div className="dinosaur-sources">
        {stage.sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            {source.label}
          </a>
        ))}
      </div>
    </details>
  );
}

function MobileDinosaurJourney({
  stages,
  activeStage,
  activeIndex,
  onSelect,
  onStep,
  canStepPrevious,
  canStepNext,
}: {
  stages: BranchItem[];
  activeStage: BranchItem;
  activeIndex: number;
  onSelect: (stage: BranchItem) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
}) {
  return (
    <section
      className="mobile-atlas mobile-dinosaur-journey"
      aria-label="Мобильная вертикальная ось динозавровой ветви"
    >
      <div className="mobile-atlas-stepper" aria-label="Переключение этапов">
        <button
          type="button"
          aria-label="Предыдущий этап"
          disabled={!canStepPrevious}
          onClick={() => onStep(-1)}
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span aria-live="polite">
          {activeIndex + 1} из {stages.length}: {activeStage.titleRu}
        </span>
        <button
          type="button"
          aria-label="Следующий этап"
          disabled={!canStepNext}
          onClick={() => onStep(1)}
        >
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>

      <div className="mobile-stage-map" aria-label="Вертикальная карта этапов">
        {dinosaurJourneyZones.map((zone) => {
          const from = stages.findIndex((stage) => stage.id === zone.fromId);
          const to = stages.findIndex((stage) => stage.id === zone.toId);
          return (
            <section
              className="mobile-era-group"
              key={zone.id}
              style={{ "--mobile-era-color": zone.color } as CSSProperties}
            >
              <div className="mobile-era-heading">
                <span>{zone.label}</span>
                <small>
                  {formatAge(stages[from].ageMa)} —{" "}
                  {formatAge(stages[to].ageMa)}
                </small>
              </div>
              <div className="mobile-era-stages">
                {stages.slice(from, to + 1).map((stage) => {
                  const isActive = stage.id === activeStage.id;
                  return (
                    <article
                      key={stage.id}
                      data-stage-id={stage.id}
                      data-is-kpg={
                        stage.id === "kpg-survivors" ? "true" : undefined
                      }
                      className={`mobile-stage-row mobile-dinosaur-stage-row${isActive ? " is-active" : ""}`}
                    >
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => {
                          onSelect(stage);
                          requestAnimationFrame(() =>
                            document
                              .querySelector(`[data-stage-id="${stage.id}"]`)
                              ?.scrollIntoView({ block: "start" }),
                          );
                        }}
                      >
                        <span>{formatAge(stage.ageMa)}</span>
                        <strong>{stage.titleRu}</strong>
                      </button>
                      {isActive ? (
                        <MobileStageDetail
                          stage={stage}
                          className="mobile-dinosaur-stage-detail"
                          afterContent={<DinosaurEvidence stage={stage} />}
                          lightboxAriaLabel="Увеличенное изображение вида"
                        />
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function DinosaurTimelineAxis({
  stages,
  activeStage,
  onSelect,
  onStep,
  canStepPrevious,
  canStepNext,
}: {
  stages: BranchItem[];
  activeStage: BranchItem;
  onSelect: (stage: BranchItem) => void;
  onStep: (delta: number) => void;
  canStepPrevious: boolean;
  canStepNext: boolean;
}) {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const positions = useMemo(() => makeReadablePositions(stages), [stages]);
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStage.id),
  );
  const activeDisplayPosition = positions[activeIndex] ?? 4;
  const positionById = useMemo(() => {
    const map = new Map<string, number>();
    stages.forEach((stage, index) => map.set(stage.id, positions[index] ?? 0));
    return map;
  }, [positions, stages]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" && canStepNext) {
      event.preventDefault();
      onStep(1);
    }

    if (event.key === "ArrowLeft" && canStepPrevious) {
      event.preventDefault();
      onStep(-1);
    }
  }

  return (
    <section
      className="axis-panel primate-focus-panel dinosaur-time-panel"
      aria-label="Временная шкала динозавровой ветви"
    >
      <div className="axis-toolbar">
        <div
          className="deep-time-selection dinosaur-axis-current"
          aria-live="polite"
        >
          <span>
            {formatAge(activeStage.ageMa)} · {activeIndex + 1} из{" "}
            {stages.length}
          </span>
          <strong>{activeStage.titleRu}</strong>
        </div>
        <div className="axis-step-controls" aria-label="Переключение этапов">
          <button
            type="button"
            className="axis-step-button"
            aria-label="Предыдущий этап"
            disabled={!canStepPrevious}
            onClick={() => onStep(-1)}
          >
            <ArrowLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="axis-step-button"
            aria-label="Следующий этап"
            disabled={!canStepNext}
            onClick={() => onStep(1)}
          >
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <div
        className="primate-zone-bands dinosaur-zone-bands"
        aria-label="Группы этапов"
      >
        {dinosaurJourneyZones.map((zone) => {
          const from = stages.findIndex((stage) => stage.id === zone.fromId);
          const to = stages.findIndex((stage) => stage.id === zone.toId);
          return (
            <button
              key={zone.id}
              type="button"
              style={{ "--primate-group-color": zone.color } as CSSProperties}
              aria-pressed={activeIndex >= from && activeIndex <= to}
              onClick={() => onSelect(stages[from])}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      <div
        className="deep-time-axis primate-deep-axis dinosaur-deep-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Шкала времени динозавровой ветви. Используйте стрелки влево и вправо."
      >
        <div
          className="deep-time-water primate-time-water"
          aria-hidden="true"
        />
        <FloatingPaths
          className="deep-time-floating-paths primate-time-floating-paths"
          density="panel"
        />
        <OptimizedImage
          className="primate-timeline-river-image dinosaur-timeline-river-image"
          src="/assets/images/dinosaurs/dinosaur-timeline-river-v2.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <button
          type="button"
          className="deep-time-image-zoom"
          aria-label="Увеличить иллюстрацию шкалы динозавров"
          onClick={() => setIsTimelineExpanded(true)}
        />

        <span
          className="dinosaur-kpg-boundary"
          style={{ left: `${positionById.get("kpg-survivors")}%` }}
          aria-hidden="true"
        >
          <span>K–Pg · 66 млн лет</span>
        </span>
        <span
          className="deep-active-line primate-deep-active-line"
          style={{ left: `${activeDisplayPosition}%` }}
          aria-hidden="true"
        />
        <div
          className="deep-stage-dots primate-stage-dots dinosaur-stage-dots"
          role="list"
          aria-label="Этапы на шкале динозавровой ветви"
        >
          {stages.map((stage, index) => {
            const position = positions[index] ?? 4;
            const isActive = stage.id === activeStage.id;
            return (
              <button
                key={stage.id}
                className={
                  isActive ? "deep-stage-dot is-active" : "deep-stage-dot"
                }
                style={{ left: `${position}%` }}
                type="button"
                aria-label={`${stage.titleRu}, ${formatAge(stage.ageMa)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onSelect(stage)}
              >
                <span />
              </button>
            );
          })}
        </div>
      </div>

      <Slider
        max={1000}
        min={0}
        step={1}
        value={[activeDisplayPosition * 10]}
        onValueChange={([value]) => {
          const stage = nearestStageByPosition(
            stages,
            positions,
            (value ?? 0) / 1000,
          );
          if (stage) onSelect(stage);
        }}
      />

      <div className="deep-time-ticks primate-time-ticks" aria-hidden="true">
        {timelineTicks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <p className="deep-time-instruction">
        575 млн лет назад — сегодня. Выбирайте точки, двигайте ползунок или
        используйте стрелки.
      </p>
      <ImageLightbox
        image={
          isTimelineExpanded
            ? {
                src: "/assets/images/dinosaurs/dinosaur-timeline-river-v2.jpg",
                alt: "Панорамная иллюстрация пути от общих предков позвоночных к динозаврам и птицам",
                caption:
                  "От общего предка к современным птицам. AI-реконструкция.",
              }
            : null
        }
        ariaLabel="Увеличенная иллюстрация шкалы динозавров"
        onClose={() => setIsTimelineExpanded(false)}
      />
    </section>
  );
}

function DinosaurRouteNavigation({
  stages,
  activeStage,
  onSelect,
}: {
  stages: BranchItem[];
  activeStage: BranchItem;
  onSelect: (stage: BranchItem) => void;
}) {
  const stops = dinosaurRouteStops
    .map((stop) => ({
      ...stop,
      target: stages.find((stage) => stage.id === stop.targetId),
      targetIndex: stages.findIndex((stage) => stage.id === stop.targetId),
    }))
    .filter((stop): stop is typeof stop & { target: BranchItem } =>
      Boolean(stop.target),
    );
  const activeIndex = stages.findIndex((stage) => stage.id === activeStage.id);

  return (
    <nav
      className="primate-branch-milestones dinosaur-route"
      aria-label="Маршрут динозавровой ветви"
    >
      {stops.map((stop, index) => {
        const nextStop = stops[index + 1];
        const isActive =
          activeIndex >= stop.targetIndex &&
          (!nextStop || activeIndex < nextStop.targetIndex);

        return (
          <button
            key={stop.id}
            type="button"
            className={`primate-branch-milestone${isActive ? " is-active" : ""}`}
            style={{ "--primate-group-color": stop.color } as CSSProperties}
            onClick={() => onSelect(stop.target)}
            aria-label={`${stop.label}, ${stop.range}`}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="primate-milestone-group">{stop.label}</span>
            <span>{stop.range}</span>
            <strong>{stop.target.titleRu}</strong>
            <small>{stop.target.inherited.slice(0, 2).join(" · ")}</small>
          </button>
        );
      })}
    </nav>
  );
}

export function DinosaursPage() {
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = document.querySelector(".topbar");
    if (!header) return;
    const update = () =>
      pageRef.current?.style.setProperty(
        "--dinosaurs-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const isMobileDinosaurAxis = useMediaQuery("(max-width: 720px)");
  const [activeJourneyId, setActiveJourneyId] = useState(
    dinosaurJourney[0]?.id ?? "early-animals",
  );

  const activeJourneyStage = useMemo(
    () =>
      dinosaurJourney.find((stage) => stage.id === activeJourneyId) ??
      dinosaurJourney[0],
    [activeJourneyId],
  );
  if (!activeJourneyStage) return null;

  const activeIndex = Math.max(
    0,
    dinosaurJourney.findIndex((stage) => stage.id === activeJourneyStage.id),
  );
  const canStepPrevious = activeIndex > 0;
  const canStepNext = activeIndex < dinosaurJourney.length - 1;

  function moveActive(delta: number) {
    const next = getStepTarget(dinosaurJourney, activeJourneyStage.id, delta);
    setActiveJourneyId(next.id);
    if (isMobileDinosaurAxis)
      requestAnimationFrame(() => {
        pageRef.current
          ?.querySelector(`[data-stage-id="${next.id}"]`)
          ?.scrollIntoView({ block: "start" });
      });
  }

  function revealStage(stageId: string, moveFocus = false) {
    setActiveJourneyId(stageId);
    requestAnimationFrame(() => {
      const target = pageRef.current?.querySelector<HTMLElement>(
        isMobileDinosaurAxis
          ? `[data-stage-id="${stageId}"]`
          : "#dinosaur-chronology",
      );
      target?.scrollIntoView({ block: "start" });
      if (moveFocus) {
        const focusTarget = isMobileDinosaurAxis
          ? target?.querySelector<HTMLButtonElement>(":scope > button")
          : pageRef.current?.querySelector<HTMLElement>(".dinosaur-deep-axis");
        focusTarget?.focus({ preventScroll: true });
      }
    });
  }

  return (
    <section
      ref={pageRef}
      className="atlas dinosaurs-page"
      data-tour-stop-id="page-dinosaurs"
    >
      <PageHeader
        className="atlas-hero dinosaur-hero"
        eyebrow="Динозавры и птицы"
        title="Вымерли ли динозавры"
        decoration={
          !isMobileDinosaurAxis ? (
            <>
              <FloatingPaths className="atlas-hero-paths" />
              <ConstellationField className="atlas-hero-constellation" />
            </>
          ) : null
        }
      >
        {dinosaurAnswer}
      </PageHeader>
      <section className="theory-bridge-band atlas-note-band">
        <div>
          <Star aria-hidden="true" size={22} />
          <div>
            <h2>Хронология динозавров и птиц</h2>
            <p>
              575 млн лет. От общих предков позвоночных к современным птицам.
            </p>
          </div>
        </div>
        <nav className="primate-page-nav" aria-label="На этой странице">
          <a href="#dinosaur-timeline">Шкала</a>
          <a href="#dinosaur-common-ancestor">Общий предок</a>
          <a href="#dinosaurs-curiosity-facts">Признаки птиц</a>
        </nav>
      </section>

      <section
        id="dinosaur-timeline"
        className="dinosaur-axis-section is-journey"
        aria-label="От общего предка к современным птицам"
      >
        <nav
          id="dinosaur-chronology"
          className="wow-facts-band dinosaur-chronology"
          aria-label="Ключевые даты динозавровой ветви"
        >
          {dinosaurMilestones.map((milestone, index) => {
            const next = dinosaurMilestones[index + 1];
            const isCurrent =
              activeIndex >= milestone.stageIndex &&
              (!next || activeIndex < next.stageIndex);
            const Icon = milestone.icon;
            return (
              <article key={milestone.id}>
                <div className="wow-fact-heading">
                  <Icon aria-hidden="true" size={16} />
                  <span>{milestone.label}</span>
                </div>
                <div className="wow-fact-value">
                  <strong>{milestone.value}</strong>
                  <p>{milestone.text}</p>
                </div>
                <button
                  className="dinosaur-milestone-select"
                  type="button"
                  aria-label={`${milestone.label}, ${milestone.date}`}
                  aria-description={milestone.note}
                  title={`${milestone.date}. ${milestone.note}`}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => revealStage(milestone.id)}
                >
                  <ArrowRight aria-hidden="true" size={15} />
                </button>
              </article>
            );
          })}
        </nav>
        {isMobileDinosaurAxis ? (
          <MobileDinosaurJourney
            stages={dinosaurJourney}
            activeStage={activeJourneyStage}
            activeIndex={activeIndex}
            onSelect={(stage) => setActiveJourneyId(stage.id)}
            onStep={moveActive}
            canStepPrevious={canStepPrevious}
            canStepNext={canStepNext}
          />
        ) : (
          <div className="atlas-grid dinosaur-atlas-grid">
            <div className="center-stage">
              <DinosaurTimelineAxis
                stages={dinosaurJourney}
                activeStage={activeJourneyStage}
                onSelect={(stage) => setActiveJourneyId(stage.id)}
                onStep={moveActive}
                canStepPrevious={canStepPrevious}
                canStepNext={canStepNext}
              />

              <div
                className="primate-branch-panel dinosaur-route-card"
                aria-label="Навигация по ветви динозавров"
              >
                <div className="primate-branch-panel-heading">
                  <div>
                    <p className="eyebrow">Маршрут по ветви</p>
                    <h2 id="bird-dinosaur-branch">
                      От общего предка к современным птицам
                    </h2>
                  </div>
                  <span>
                    {activeIndex + 1} из {dinosaurJourney.length}
                  </span>
                </div>
                <DinosaurRouteNavigation
                  stages={dinosaurJourney}
                  activeStage={activeJourneyStage}
                  onSelect={(stage) => setActiveJourneyId(stage.id)}
                />
              </div>
            </div>

            <StageDetailCard
              stage={activeJourneyStage}
              className="dinosaur-detail-card"
              afterContent={
                <DinosaurEvidence
                  key={activeJourneyStage.id}
                  stage={activeJourneyStage}
                />
              }
              lightboxAriaLabel="Увеличенное изображение вида"
            />
          </div>
        )}
      </section>

      <div className="dinosaur-reading">
        <section
          id="dinosaur-common-ancestor"
          className="dinosaur-reading-section dinosaur-common-ancestor"
          aria-labelledby="dinosaur-common-ancestor-title"
        >
          <DinosaurIllustration
            image={{
              src: "/assets/images/dinosaurs/common-ancestor-amniote-generated.jpg",
              altRu:
                "AI-реконструкция раннего амниота — близкого образа нашего общего предка с птицами.",
              kind: "generated-reconstruction",
              credit: "AI-реконструкция",
              license: "AI-реконструкция",
              sourceUrl: "https://openai.com/",
            }}
            title="Ранние амниоты"
            className="dinosaur-common-ancestor__media"
          />
          <div className="dinosaur-reading-copy">
            <p className="eyebrow">
              Общий предок с птицами · {dinosaurCommonAncestor.valueRu}
            </p>
            <h2 id="dinosaur-common-ancestor-title">
              {dinosaurCommonAncestor.titleRu}
            </h2>
            <p>{dinosaurCommonAncestor.summaryRu}</p>
            <div
              className="dinosaur-lineage-comparison"
              aria-label="Две ветви после ранних амниот"
            >
              <article>
                <span className="eyebrow">Наша линия</span>
                <h3>Млекопитающие и человек</h3>
                <p>{dinosaurCommonAncestor.humanBranchRu}</p>
                <Link className="dinosaur-reading-link" to="/primates">
                  К приматам и человеку{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
              <article>
                <span className="eyebrow">Линия птиц</span>
                <h3>Динозавры и птицы</h3>
                <p>{dinosaurCommonAncestor.dinosaurBranchRu}</p>
                <button
                  className="dinosaur-reading-link"
                  type="button"
                  onClick={() => revealStage("diapsids", true)}
                >
                  Показать ветвь птиц{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
            </div>
            <Link
              className="dinosaur-reading-link dinosaur-atlas-link"
              to="/?mode=all&stage=amniotes"
            >
              Общий предок в Атласе <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          id="dinosaurs-curiosity-facts"
          className="dinosaur-reading-section dinosaur-feathers"
          aria-labelledby="dinosaur-feathers-title"
        >
          <div className="dinosaur-reading-copy">
            <p className="eyebrow">От теропод к птицам</p>
            <h2 id="dinosaur-feathers-title">{featherFact.titleRu}</h2>
            <p>{featherFact.shortRu}</p>
            <p>{featherFact.detailRu}</p>
            <div className="dinosaur-reading-actions">
              <button
                className="button button-secondary button-sm"
                type="button"
                onClick={() => revealStage(featheredDinosaur.id, true)}
              >
                Пернатые динозавры на шкале{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <a
                className="dinosaur-reading-link"
                href={featherFact.source.url}
                target="_blank"
                rel="noreferrer"
              >
                Источник <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <DinosaurIllustration
            image={featheredDinosaur.image}
            title="Пернатые динозавры"
            className="dinosaur-feathers-media"
          />
        </section>
      </div>
    </section>
  );
}
