import { PageHeader } from "../components/ui/PageHeader";
import "../styles/pages/dinosaurs.css";
import { ArrowLeft, ArrowRight, ChevronDown, GitBranch } from "lucide-react";
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
import { CuriosityFacts } from "../components/education/CuriosityFacts";
import { GlossaryTermById } from "../components/education/GlossaryTerm";
import { FloatingPaths } from "../components/ui/floating-paths";
import { ImageLightbox } from "../components/ui/image-lightbox";
import { OptimizedImage } from "../components/ui/optimized-image";
import { Slider } from "../components/ui/slider";
import { CURIOSITY_FACT_PAGE_GROUPS } from "../data/curiosityFacts";
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

const dinosaurFacts = [
  {
    label: "Мезозойская история",
    value: "~165 млн лет",
    text: "динозавровая ветвь существовала от позднего триаса до K-Pg; наземная доминация усилилась после триасово-юрского кризиса.",
  },
  {
    label: "До первых птиц",
    value: "~80 млн лет",
    text: "прошло от ранних динозавров триаса до Archaeopteryx и близких ранних avialae.",
  },
  {
    label: "Рубеж K-Pg",
    value: "66 млн лет",
    text: "назад исчезли нептичьи динозавры, но часть птичьей ветви пережила глобальный кризис.",
  },
  {
    label: "Живая ветвь",
    value: "более 10 000 видов",
    text: "современные птицы — самая разнообразная ныне живущая динозавровая линия.",
  },
  {
    label: "Наш общий предок",
    value: "~320 млн лет",
    text: "назад ранние амниоты дали две линии: синапсидную к млекопитающим и диапсидную к динозаврам/птицам.",
  },
];

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
        {dinosaurAnswer} От общих предков позвоночных к современным птицам — 575
        млн лет истории.
      </PageHeader>
      <div className="primate-intro-tools">
        <details className="primate-context-note">
          <summary>
            <h2>Что связывает человека и динозавров?</h2>
            <ChevronDown aria-hidden="true" size={17} />
          </summary>
          <p>
            До <GlossaryTermById id="amniotes">амниот</GlossaryTermById> — общая
            линия с нами. После развилки{" "}
            <GlossaryTermById id="diapsids">диапсиды</GlossaryTermById> ведут к
            динозаврам и птицам, а синапсиды — к млекопитающим и человеку.
          </p>
        </details>
        <nav className="primate-page-nav" aria-label="На этой странице">
          <a href="#dinosaur-timeline">Шкала</a>
          <a href="#dinosaur-common-ancestor">Общий предок</a>
          <a href="#dinosaurs-curiosity-facts">Признаки птиц</a>
        </nav>
      </div>

      <section
        id="dinosaur-timeline"
        className="dinosaur-axis-section is-journey"
        aria-label="От общего предка к современным птицам"
      >
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

      <section
        className="wow-facts-band dinosaur-facts-band"
        aria-label="Факты о динозаврах и птицах"
      >
        {dinosaurFacts.map(({ label, value }) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section
        id="dinosaur-common-ancestor"
        className="dinosaur-common-ancestor"
        aria-labelledby="dinosaur-common-ancestor-title"
      >
        <div className="dinosaur-section-heading">
          <GitBranch aria-hidden="true" size={22} />
          <div>
            <p className="eyebrow">Общий предок с птицами</p>
            <h2 id="dinosaur-common-ancestor-title">
              {dinosaurCommonAncestor.titleRu}, {dinosaurCommonAncestor.valueRu}
            </h2>
            <p>{dinosaurCommonAncestor.summaryRu}</p>
          </div>
        </div>
        <div className="dinosaur-ancestor-layout">
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
          <div
            className="dinosaur-ancestor-tree"
            aria-label="Две ветви после ранних амниот"
          >
            <div className="dinosaur-ancestor-root">
              <span>Общая точка</span>
              <strong>Ранние амниоты</strong>
              <small>~320 млн лет назад</small>
            </div>
            <div className="dinosaur-common-ancestor__split">
              <article>
                <span>Наша линия</span>
                <strong>Млекопитающие и человек</strong>
                <p>{dinosaurCommonAncestor.humanBranchRu}</p>
                <Link to="/primates">
                  К приматам и человеку{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
              <article>
                <span>Линия птиц</span>
                <strong>Динозавры и птицы</strong>
                <p>{dinosaurCommonAncestor.dinosaurBranchRu}</p>
                <a href="#dinosaur-timeline">
                  К шкале <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            </div>
          </div>
        </div>
      </section>
      <CuriosityFacts
        factIds={CURIOSITY_FACT_PAGE_GROUPS.dinosaurs}
        eyebrow="От теропод к птицам"
        title="Птичьи признаки собирались по частям"
        description="Перо, лёгкий скелет и крыло складывались постепенно; разные детали сперва служили разным задачам."
        headingId="dinosaurs-curiosity-facts"
      />

      <details className="dinosaur-context-facts">
        <summary>
          Подробнее о цифрах раздела{" "}
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <dl>
          {dinosaurFacts.map(({ label, text }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="dinosaurs-bridge">
        <div>
          <strong>А где наша линия?</strong>
          <p>
            Вернитесь в Атлас: там показано, почему млекопитающие и птицы
            расходятся после амниот.
          </p>
        </div>
        <Link className="button button-secondary button-md" to="/">
          Открыть Атлас
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
