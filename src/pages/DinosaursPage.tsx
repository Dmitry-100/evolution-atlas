import { ArrowRight, Bird, Feather, GitBranch, ShieldAlert, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  birdDinosaurBranch,
  dinosaurAnswer,
  sharedAnimalBranch,
  type DinosaurLineageStage,
} from "../data/dinosaurLineage";
import type { EvolutionStage, SourceRef, StageImage } from "../data/lineage";

type BranchItem = EvolutionStage | DinosaurLineageStage;

const formatAge = (ageMa: number) => {
  if (ageMa === 0) {
    return "сегодня";
  }
  return `${ageMa.toLocaleString("ru-RU")} млн лет назад`;
};

const getImage = (stage: BranchItem): StageImage => stage.image;
const getSources = (stage: BranchItem): SourceRef[] => stage.sources;
const getWhyMatters = (stage: BranchItem) =>
  "whyMattersRu" in stage ? stage.whyMattersRu : "Этот этап помогает увидеть развилку, от которой дальше уходит птичья линия.";
const getEvidence = (stage: BranchItem) =>
  "evidenceRu" in stage ? stage.evidenceRu : "Эта точка уже описана в основной линии Атласа и переиспользуется здесь как общий животный фундамент.";

function BranchDetail({ stage, label }: { stage: BranchItem; label: string }) {
  const image = getImage(stage);
  const sources = getSources(stage);

  return (
    <article className="dinosaur-detail-card" aria-live="polite">
      <figure className="dinosaur-detail-visual">
        <img src={image.src} alt={image.altRu} loading="lazy" />
        <figcaption>
          {image.credit}
          <span>{image.kind === "local-plate" ? "локальная иллюстрация" : image.license}</span>
        </figcaption>
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

        <div className="dinosaur-sources">
          {sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

function BranchRoute({
  stages,
  activeId,
  onSelect,
  variant = "shared",
}: {
  stages: BranchItem[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: "shared" | "dinosaur";
}) {
  return (
    <div className={`dinosaur-branch-route is-${variant}`} aria-label={variant === "shared" ? "Общая животная линия" : "Динозавровая ветвь"}>
      {stages.map((stage, index) => (
        <button
          key={stage.id}
          className={variant === "dinosaur" ? "dinosaur-branch-card" : "shared-branch-card"}
          type="button"
          aria-pressed={activeId === stage.id}
          onClick={() => onSelect(stage.id)}
        >
          <span className="dinosaur-branch-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="dinosaur-branch-dot" aria-hidden="true" />
          <span className="dinosaur-branch-title">{stage.titleRu}</span>
          <span className="dinosaur-branch-date">{formatAge(stage.ageMa)}</span>
        </button>
      ))}
    </div>
  );
}

export function DinosaursPage() {
  const [activeSharedId, setActiveSharedId] = useState(sharedAnimalBranch[0].id);
  const [activeDinosaurId, setActiveDinosaurId] = useState(birdDinosaurBranch[0].id);

  const activeShared = useMemo(
    () => sharedAnimalBranch.find((stage) => stage.id === activeSharedId) ?? sharedAnimalBranch[0],
    [activeSharedId],
  );
  const activeDinosaur = useMemo(
    () => birdDinosaurBranch.find((stage) => stage.id === activeDinosaurId) ?? birdDinosaurBranch[0],
    [activeDinosaurId],
  );

  return (
    <section className="document-page dinosaurs-page">
      <div className="dinosaurs-hero">
        <div>
          <p className="eyebrow">От амниот к птицам</p>
          <h1>Вымерли ли динозавры</h1>
          <p>
            Короткий ответ звучит неожиданно: {dinosaurAnswer} Поэтому голубь за окном ближе к тероподам, чем к
            крокодилам, ящерицам или нашей млекопитающей линии.
          </p>
        </div>
        <div className="dinosaurs-answer-card">
          <Bird aria-hidden="true" size={36} />
          <strong>{dinosaurAnswer}</strong>
          <span>Сначала общий фундамент животных, затем отдельная ветка динозавров до птиц.</span>
        </div>
      </div>

      <section className="dinosaur-branch-section" aria-labelledby="shared-animal-branch">
        <div className="dinosaur-section-heading">
          <GitBranch aria-hidden="true" size={22} />
          <div>
            <p className="eyebrow">Блок 1</p>
            <h2 id="shared-animal-branch">Общая животная линия</h2>
            <p>
              Это не ветка динозавров и не ветка человека. Это общий фундамент позвоночных, от которого потом расходятся
              линии млекопитающих и диапсид.
            </p>
          </div>
        </div>
        <BranchRoute stages={sharedAnimalBranch} activeId={activeShared.id} onSelect={setActiveSharedId} />
        <BranchDetail stage={activeShared} label="общий предок животной линии" />
      </section>

      <section className="dinosaur-branch-section is-dinosaurs" aria-labelledby="bird-dinosaur-branch">
        <div className="dinosaur-section-heading">
          <Feather aria-hidden="true" size={22} />
          <div>
            <p className="eyebrow">Блок 2</p>
            <h2 id="bird-dinosaur-branch">Динозавры → птицы</h2>
            <p>
              Здесь отдельный маршрут: от диапсид и архозавров к тероподам, перьям, ранним птицам и современным птицам.
            </p>
          </div>
        </div>
        <BranchRoute
          stages={birdDinosaurBranch}
          activeId={activeDinosaur.id}
          onSelect={setActiveDinosaurId}
          variant="dinosaur"
        />
        <BranchDetail stage={activeDinosaur} label="динозавровая ветвь" />
      </section>

      <div className="dinosaurs-bridge">
        <div>
          <strong>А где наша линия?</strong>
          <p>Вернитесь в Атлас: там показано, почему млекопитающие и птицы расходятся после амниот.</p>
        </div>
        <Link className="button button-secondary button-md" to="/">
          Открыть Атлас
          <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
    </section>
  );
}
