import { GitFork, Milestone } from "lucide-react";
import { getGlossaryTerm } from "../../data/glossary";
import type { EvolutionStage } from "../../data/lineage";
import type { Cladogram } from "../../lib/cladogram";
import { formatAgeRu } from "../../lib/timeline";
import { GlossaryTerm } from "./GlossaryTerm";

type CladogramPanelProps = {
  tree: Cladogram;
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

export function CladogramPanel({ tree, activeStage, onActivate }: CladogramPanelProps) {
  const cladogramTerm = getGlossaryTerm("cladogram");

  return (
    <section className="cladogram-panel" aria-labelledby="cladogram-heading">
      <div className="cladogram-heading">
        <GitFork aria-hidden="true" size={23} />
        <div>
          <div className="eyebrow">{cladogramTerm ? <GlossaryTerm term={cladogramTerm} /> : "Кладограмма"}</div>
          <h2 id="cladogram-heading">Дерево родства</h2>
          <p>
            Толстый ствол показывает нашу прямую линию, а боковые ветви — родственников, которые не являются нашими
            предками, но помогают увидеть, что эволюция ветвится.
          </p>
        </div>
      </div>

      <div className="cladogram-body">
        <div className="cladogram-trunk" aria-label="Прямая линия к Homo sapiens">
          {tree.trunk.map((stage, index) => {
            const isActive = stage.id === activeStage.id;

            return (
              <button
                key={stage.id}
                type="button"
                className={isActive ? "cladogram-node is-active" : "cladogram-node"}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onActivate(stage)}
              >
                <span className="cladogram-node-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="cladogram-node-dot" aria-hidden="true" />
                <strong>{stage.titleRu}</strong>
                <small>{formatAgeRu(stage.ageMa)}</small>
              </button>
            );
          })}
        </div>

        <div className="cladogram-branches" aria-label="Боковые ветви и близкие родственники">
          {tree.branches.map(({ stage, parent }) => {
            const isActive = stage.id === activeStage.id;

            return (
              <button
                key={stage.id}
                type="button"
                className={isActive ? "cladogram-branch is-active" : "cladogram-branch"}
                aria-current={isActive ? "true" : undefined}
                onClick={() => onActivate(stage)}
              >
                <Milestone aria-hidden="true" size={17} />
                <span>
                  <strong>{stage.titleRu}</strong>
                  <small>
                    ветвь от {parent.titleRu}, {formatAgeRu(stage.ageMa)}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
