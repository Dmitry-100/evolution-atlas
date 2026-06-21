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
  activeBranch: CladogramBranch | null;
  onActivate: (stage: EvolutionStage) => void;
  onInspectBranch: (branch: CladogramBranch) => void;
};

const ancestorScopeByStageId: Record<string, string> = {
  "cell-lines": "всё живое",
  eukaryotes: "все эукариоты",
  "early-animals": "все животные",
  bilaterians: "двусторонние животные",
  chordates: "хордовые",
  vertebrates: "позвоночные",
  "jawed-fish": "челюстные позвоночные",
  "lobe-finned": "лопастеперые",
  tetrapods: "четвероногие",
  amniotes: "амниоты",
  mammals: "млекопитающие",
  placentals: "плацентарные",
  "early-primates": "приматы",
  anthropoids: "обезьяны",
  catarrhini: "узконосые обезьяны",
  hominins: "гоминины",
  heidelbergensis: "Homo heidelbergensis",
};

function getAncestorScope(stage: EvolutionStage) {
  return ancestorScopeByStageId[stage.id] ?? stage.titleRu.toLowerCase();
}

export function CladogramPanel({
  tree,
  activeStage,
  activeBranch,
  onActivate,
  onInspectBranch,
}: CladogramPanelProps) {
  const cladogramTerm = getGlossaryTerm("cladogram");
  const branchesByParent = useMemo(() => {
    const groups = new Map<string, CladogramBranch[]>();

    for (const branch of tree.branches) {
      groups.set(branch.parent.id, [
        ...(groups.get(branch.parent.id) ?? []),
        branch,
      ]);
    }

    return groups;
  }, [tree.branches]);

  return (
    <section className="cladogram-panel" aria-labelledby="cladogram-heading">
      <div className="cladogram-heading">
        <GitFork aria-hidden="true" size={23} />
        <div>
          <div className="eyebrow">
            {cladogramTerm ? (
              <GlossaryTerm term={cladogramTerm} />
            ) : (
              "Кладограмма"
            )}
          </div>
          <h2 id="cladogram-heading">Дерево родства</h2>
          <p>
            Выбранный маршрут показывает ветвь, на которой находится Homo
            sapiens; карточки справа показывают соседние линии от общих
            предков.
          </p>
        </div>
      </div>

      <div className="cladogram-body">
        <div
          className="cladogram-reader-guide"
          aria-label="Как читать дерево родства"
        >
          <span>
            <ArrowDown aria-hidden="true" size={17} />
            Ветвь Homo sapiens
          </span>
          <span>
            <GitFork aria-hidden="true" size={17} />
            Развилка родства
          </span>
          <span>
            <Milestone aria-hidden="true" size={17} />
            Общий предок
          </span>
        </div>

        <div
          className="cladogram-map"
          aria-label="Дерево родства: сверху вниз идет наша линия, вправо показаны линии от общих предков"
        >
          {tree.trunk.map((stage, index) => {
            const branches = branchesByParent.get(stage.id) ?? [];
            const isActive = stage.id === activeStage.id;
            const hasActiveBranch = branches.some(
              (branch) =>
                branch.stage?.id === activeStage.id ||
                branch.id === activeBranch?.id,
            );
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
                    className={
                      isActive ? "cladogram-node is-active" : "cladogram-node"
                    }
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => onActivate(stage)}
                  >
                    <span className="cladogram-node-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="cladogram-node-dot" aria-hidden="true" />
                    <span className="cladogram-node-copy">
                      <small>ветвь Homo sapiens</small>
                      <strong>{stage.titleRu}</strong>
                      <em>{formatAgeRu(stage.ageMa)}</em>
                    </span>
                    {isActive ? (
                      <span className="cladogram-active-badge">выбрано</span>
                    ) : null}
                  </button>
                </div>

                <div className="cladogram-branch-cell">
                  {branches.map((branch) => {
                    const branchIsActive =
                      branch.stage?.id === activeStage.id ||
                      branch.id === activeBranch?.id;
                    const branchClassName = [
                      "cladogram-branch",
                      branch.kind === "context" ? "is-context" : "",
                      branchIsActive ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        className={branchClassName}
                        aria-current={branchIsActive ? "true" : undefined}
                        onClick={() =>
                          branch.stage
                            ? onActivate(branch.stage)
                            : onInspectBranch(branch)
                        }
                      >
                        <span className="cladogram-branch-thumb">
                          <img
                            src={branch.image.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        <span className="cladogram-branch-copy">
                          <small>
                            общий предок: {getAncestorScope(branch.parent)}
                          </small>
                          <strong>{branch.titleRu}</strong>
                          <em>
                            {branch.ageMa
                              ? formatAgeRu(branch.ageMa)
                              : "возраст узла уточняется"}
                          </em>
                        </span>
                        <Milestone
                          className="cladogram-branch-icon"
                          aria-hidden="true"
                          size={17}
                        />
                        {branchIsActive ? (
                          <span className="cladogram-active-badge">
                            выбрано
                          </span>
                        ) : null}
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
