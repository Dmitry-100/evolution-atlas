import { useMemo } from "react";
import { ArrowDown, GitFork, Milestone } from "lucide-react";
import { getGlossaryTerm } from "../../data/glossary";
import type { EvolutionStage } from "../../data/lineage";
import type { Cladogram, CladogramBranch } from "../../lib/cladogram";
import { formatAgeRu } from "../../lib/timeline";
import { GlossaryTerm } from "./GlossaryTerm";

type CladogramPanelProps = {
  tree: Cladogram;
  activeStage: EvolutionStage;
  onActivate: (stage: EvolutionStage) => void;
};

export function CladogramPanel({ tree, activeStage, onActivate }: CladogramPanelProps) {
  const cladogramTerm = getGlossaryTerm("cladogram");
  const branchesByParent = useMemo(() => {
    const groups = new Map<string, CladogramBranch[]>();

    for (const branch of tree.branches) {
      groups.set(branch.parent.id, [...(groups.get(branch.parent.id) ?? []), branch]);
    }

    return groups;
  }, [tree.branches]);

  return (
    <section className="cladogram-panel" aria-labelledby="cladogram-heading">
      <div className="cladogram-heading">
        <GitFork aria-hidden="true" size={23} />
        <div>
          <div className="eyebrow">{cladogramTerm ? <GlossaryTerm term={cladogramTerm} /> : "Кладограмма"}</div>
          <h2 id="cladogram-heading">Дерево родства</h2>
          <p>
            Читайте сверху вниз: толстый ствол ведет к Homo sapiens, а карточки справа отходят от конкретных узлов как
            боковые ветви родства.
          </p>
        </div>
      </div>

      <div className="cladogram-body">
        <div className="cladogram-reader-guide" aria-label="Как читать дерево родства">
          <span>
            <ArrowDown aria-hidden="true" size={17} />
            Главный ствол к человеку
          </span>
          <span>
            <GitFork aria-hidden="true" size={17} />
            Развилка родства
          </span>
          <span>
            <Milestone aria-hidden="true" size={17} />
            Боковая ветвь
          </span>
        </div>

        <div className="cladogram-map" aria-label="Дерево родства: сверху вниз идет наша линия, вправо отходят боковые ветви">
          {tree.trunk.map((stage, index) => {
            const branches = branchesByParent.get(stage.id) ?? [];
            const isActive = stage.id === activeStage.id;
            const hasActiveBranch = branches.some((branch) => branch.stage.id === activeStage.id);
            const rowClassName = [
              "cladogram-row",
              branches.length > 0 ? "has-branches" : "",
              isActive || hasActiveBranch ? "is-active-row" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={stage.id} className={rowClassName}>
                <div className="cladogram-trunk-cell">
                  <button
                    type="button"
                    className={isActive ? "cladogram-node is-active" : "cladogram-node"}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => onActivate(stage)}
                  >
                    <span className="cladogram-node-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="cladogram-node-dot" aria-hidden="true" />
                    <span className="cladogram-node-copy">
                      <small>ствол к человеку</small>
                      <strong>{stage.titleRu}</strong>
                      <em>{formatAgeRu(stage.ageMa)}</em>
                    </span>
                    {isActive ? <span className="cladogram-active-badge">выбрано</span> : null}
                  </button>
                </div>

                <div className="cladogram-branch-cell">
                  {branches.map(({ stage: branchStage, parent }) => {
                    const branchIsActive = branchStage.id === activeStage.id;

                    return (
                      <button
                        key={branchStage.id}
                        type="button"
                        className={branchIsActive ? "cladogram-branch is-active" : "cladogram-branch"}
                        aria-current={branchIsActive ? "true" : undefined}
                        onClick={() => onActivate(branchStage)}
                      >
                        <Milestone aria-hidden="true" size={17} />
                        <span>
                          <small>боковая ветвь от {parent.titleRu}</small>
                          <strong>{branchStage.titleRu}</strong>
                          <em>{formatAgeRu(branchStage.ageMa)}</em>
                        </span>
                        {branchIsActive ? <span className="cladogram-active-badge">выбрано</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
