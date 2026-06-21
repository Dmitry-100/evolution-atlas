import {
  ArrowLeft,
  ArrowRight,
  Bird,
  BookOpen,
  Camera,
  Clock3,
  Crown,
  GitBranch,
  MoveHorizontal,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { FloatingPaths } from "../components/ui/floating-paths";
import { OptimizedImage } from "../components/ui/optimized-image";
import { Slider } from "../components/ui/slider";
import {
  birdDinosaurBranch,
  dinosaurCommonAncestor,
  dinosaurAnswer,
  sharedAnimalBranch,
  type DinosaurLineageStage,
} from "../data/dinosaurLineage";
import type { EvolutionStage, StageImage } from "../data/lineage";

type BranchItem = EvolutionStage | DinosaurLineageStage;

const dinosaurJourney: BranchItem[] = [
  ...sharedAnimalBranch,
  ...birdDinosaurBranch,
];
const dinosaurJourneyZones = [
  {
    id: "shared",
    label: "общий фундамент позвоночных",
    fromId: "early-animals",
    toId: "amniotes",
  },
  {
    id: "birds",
    label: "динозавры → птицы",
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
    label: "Животн.",
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
    label: "Диапс.",
    targetId: "diapsids",
    range: "310 млн лет",
    color: "#98ad70",
  },
  {
    id: "archosaurs",
    label: "Архоз.",
    targetId: "archosaurs",
    range: "250 млн лет",
    color: "#d28c59",
  },
  {
    id: "dinosaurs",
    label: "Диноз.",
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
  {
    id: "today",
    label: "Сегодня",
    targetId: "modern-birds",
    range: "0 млн лет",
    color: "#90b886",
  },
];

const dinosaurFacts = [
  {
    icon: Crown,
    label: "Мезозойская история",
    value: "~165 млн лет",
    text: "динозавровая ветвь существовала от позднего триаса до K-Pg; наземная доминация усилилась после триасово-юрского кризиса.",
  },
  {
    icon: Clock3,
    label: "До первых птиц",
    value: "~80 млн лет",
    text: "прошло от ранних динозавров триаса до Archaeopteryx и близких ранних avialae.",
  },
  {
    icon: Waves,
    label: "Рубеж K-Pg",
    value: "66 млн лет",
    text: "назад исчезли нептичьи динозавры, но часть птичьей ветви пережила глобальный кризис.",
  },
  {
    icon: Bird,
    label: "Живая ветвь",
    value: "10 000+ видов",
    text: "современные птицы - самая разнообразная ныне живущая динозавровая линия.",
  },
  {
    icon: GitBranch,
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

const getImage = (stage: BranchItem): StageImage => stage.image;
const getWhyMatters = (stage: BranchItem) =>
  "whyMattersRu" in stage
    ? stage.whyMattersRu
    : "Этот этап помогает увидеть развилку, от которой дальше уходит птичья линия.";
const getEvidence = (stage: BranchItem) =>
  "evidenceRu" in stage
    ? stage.evidenceRu
    : "Эта точка уже описана в основной линии Атласа и переиспользуется здесь как общий животный фундамент.";
const getJourneyLabel = (stage: BranchItem) =>
  birdDinosaurBranch.some((candidate) => candidate.id === stage.id)
    ? "динозавровая ветвь"
    : "общий фундамент животной линии";

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

function BranchDetail({ stage, label }: { stage: BranchItem; label: string }) {
  const image = getImage(stage);

  return (
    <article className="dinosaur-detail-card" aria-live="polite">
      <figure className="dinosaur-detail-visual">
        <img
          src={image.src}
          alt={image.altRu}
          loading="lazy"
          decoding="async"
        />
        {image.kind === "generated-reconstruction" ? (
          <figcaption>AI-реконструкция</figcaption>
        ) : null}
      </figure>

      <div className="dinosaur-detail-copy">
        <p className="eyebrow">{label}</p>
        <h2>{stage.titleRu}</h2>
        <p className="latin-name">{stage.latin}</p>
        <p className="dinosaur-age">{formatAge(stage.ageMa)}</p>
        <p>{stage.summaryRu}</p>

        <div className="dinosaur-proof">
          <strong>
            <Sparkles aria-hidden="true" size={17} />
            Почему это важно
          </strong>
          <p>{getWhyMatters(stage)}</p>
        </div>

        <div className="dinosaur-proof is-evidence">
          <strong>
            <ShieldAlert aria-hidden="true" size={17} />
            На чем держится вывод
          </strong>
          <p>{getEvidence(stage)}</p>
        </div>

        <div className="dinosaur-traits">
          {stage.inherited.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>

      </div>
    </article>
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
  const positions = useMemo(() => makeReadablePositions(stages), [stages]);
  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === activeStage.id),
  );
  const activeDisplayPosition = positions[activeIndex] ?? 4;
  const activeCardClass =
    activeDisplayPosition > 82
      ? "deep-active-card align-right"
      : activeDisplayPosition < 18
        ? "deep-active-card align-left"
        : "deep-active-card";
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
      className="axis-panel dinosaur-time-panel"
      aria-label="Временная шкала динозавровой ветви"
    >
      <div className="axis-toolbar">
        <span className="axis-toolbar-copy">
          <MoveHorizontal aria-hidden="true" size={19} />
          Нажимайте точки, двигайте ползунок или используйте стрелки
        </span>
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
        <strong>575 млн лет назад → сегодня</strong>
      </div>

      <div
        className="deep-time-axis dinosaur-deep-axis"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Шкала времени динозавровой ветви. Используйте стрелки влево и вправо."
      >
        <div
          className="deep-time-water dinosaur-time-water"
          aria-hidden="true"
        />
        <FloatingPaths
          className="deep-time-floating-paths dinosaur-time-floating-paths"
          density="panel"
        />
        <OptimizedImage
          className="dinosaur-timeline-river-image"
          src="/assets/images/dinosaurs/dinosaur-timeline-river.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />

        <div className="dinosaur-zone-bands" aria-hidden="true">
          {dinosaurJourneyZones.map((zone) => {
            const from = positionById.get(zone.fromId);
            const to = positionById.get(zone.toId);
            if (from === undefined || to === undefined) return null;
            const left = Math.min(from, to);
            const right = Math.max(from, to);
            return (
              <span
                key={zone.id}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(8, right - left)}%`,
                }}
              >
                {zone.label}
              </span>
            );
          })}
        </div>

        <span
          className="deep-active-line"
          style={{ left: `${activeDisplayPosition}%` }}
          aria-hidden="true"
        />
        <div className={activeCardClass} style={{ left: `${activeDisplayPosition}%` }}>
          <span>{formatAge(activeStage.ageMa)}</span>
          <strong>{activeStage.titleRu}</strong>
          <small>{getJourneyLabel(activeStage)}</small>
        </div>

        <div
          className="deep-stage-dots dinosaur-stage-dots"
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
                onPointerDown={() => onSelect(stage)}
                onMouseDown={() => onSelect(stage)}
                onTouchStart={() => onSelect(stage)}
                onFocus={() => onSelect(stage)}
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

      <div className="deep-time-ticks dinosaur-time-ticks" aria-hidden="true">
        {timelineTicks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
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
    .filter(
      (stop): stop is (typeof stop & { target: BranchItem }) =>
        Boolean(stop.target),
    );
  const activeIndex = stages.findIndex((stage) => stage.id === activeStage.id);

  return (
    <nav
      className="era-route dinosaur-route"
      aria-label="Маршрут динозавровой ветви"
      style={{ "--era-count": stops.length } as CSSProperties}
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
            className={isActive ? "era-route-item is-active" : "era-route-item"}
            onClick={() => onSelect(stop.target)}
            aria-label={`${stop.label}, ${stop.range}`}
          >
            <span className="era-route-marker" aria-hidden="true">
              <span
                className="era-route-node"
                style={{ background: stop.color }}
              />
            </span>
            <span className="era-route-copy">
              <span className="era-route-order">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{stop.label}</strong>
              <small>{stop.range}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function DinosaursPage() {
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
    setActiveJourneyId(
      getStepTarget(dinosaurJourney, activeJourneyStage.id, delta).id,
    );
  }

  return (
    <section className="document-page dinosaurs-page">
      <div className="dinosaurs-hero">
        <div>
          <p className="eyebrow">От амниот к птицам</p>
          <h1>Вымерли ли динозавры</h1>
          <p>
            Короткий ответ звучит неожиданно: {dinosaurAnswer} Поэтому голубь за
            окном — потомок тероподной ветви и ближе к нептичьим тероподам, чем к нашей
            млекопитающей линии.
          </p>
        </div>
        <div className="dinosaurs-answer-card">
          <Bird aria-hidden="true" size={36} />
          <strong>{dinosaurAnswer}</strong>
          <span>
            Одна шкала показывает путь от общего животного основания к живой
            птичьей ветви динозавров.
          </span>
        </div>
      </div>

      <div className="dinosaurs-map-note">
        <Camera aria-hidden="true" size={21} />
        <p>
          Смотрите как в Атласе: двигайтесь по одной оси слева направо. До
          амниот это общий фундамент, после диапсид начинается маршрут
          динозавровой ветви к птицам.
        </p>
      </div>

      <section
        className="dinosaur-facts-band"
        aria-label="Факты о динозаврах и птицах"
      >
        {dinosaurFacts.map(({ icon: Icon, label, value, text }) => (
          <article key={label}>
            <Icon aria-hidden="true" size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section
        className="dinosaur-common-ancestor"
        aria-labelledby="dinosaur-common-ancestor-title"
      >
        <div className="dinosaur-common-ancestor__lead">
          <GitBranch aria-hidden="true" size={24} />
          <div>
            <p className="eyebrow">Общий предок с птицами</p>
            <h2 id="dinosaur-common-ancestor-title">
              {dinosaurCommonAncestor.titleRu}, {dinosaurCommonAncestor.valueRu}
            </h2>
            <p>{dinosaurCommonAncestor.summaryRu}</p>
          </div>
        </div>
        <figure className="dinosaur-common-ancestor__media">
          <img
            src="/assets/images/dinosaurs/common-ancestor-amniote-generated.jpg"
            alt="AI-реконструкция раннего амниота — близкого образа нашего общего предка с птицами."
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="dinosaur-common-ancestor__split" aria-label="Две ветви после ранних амниот">
          <article>
            <span>Наша линия</span>
            <strong>{dinosaurCommonAncestor.humanBranchRu}</strong>
          </article>
          <article>
            <span>Линия птиц</span>
            <strong>{dinosaurCommonAncestor.dinosaurBranchRu}</strong>
          </article>
        </div>
      </section>

      <section
        className="dinosaur-axis-section is-journey"
        aria-labelledby="bird-dinosaur-branch"
      >
        <div className="dinosaur-section-heading">
          <GitBranch aria-hidden="true" size={22} />
          <div>
            <p className="eyebrow">Одна ось</p>
            <h2 id="bird-dinosaur-branch">Общая линия → динозавры → птицы</h2>
            <p>
              Сначала идут общие животные предки позвоночных, затем после амниот
              ось уходит в диапсидную ветвь: архозавры, динозавры, перья,
              Archaeopteryx, ранние птицы и современные птицы. Точка развилки с
              нашей линией - {dinosaurCommonAncestor.titleRu.toLowerCase()} (
              {dinosaurCommonAncestor.valueRu}).
            </p>
          </div>
        </div>

        <div className="dinosaur-atlas-grid">
          <div className="center-stage">
            <DinosaurTimelineAxis
              stages={dinosaurJourney}
              activeStage={activeJourneyStage}
              onSelect={(stage) => setActiveJourneyId(stage.id)}
              onStep={moveActive}
              canStepPrevious={canStepPrevious}
              canStepNext={canStepNext}
            />

            <div className="era-strip-card dinosaur-route-card" aria-label="Навигация по ветви динозавров">
              <div className="rail-heading">
                <BookOpen aria-hidden="true" size={19} />
                <span>Маршрут по ветви</span>
              </div>
              <DinosaurRouteNavigation
                stages={dinosaurJourney}
                activeStage={activeJourneyStage}
                onSelect={(stage) => setActiveJourneyId(stage.id)}
              />
            </div>
          </div>

          <BranchDetail
            stage={activeJourneyStage}
            label={getJourneyLabel(activeJourneyStage)}
          />
        </div>
      </section>

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
