import { useMemo } from "react";
import { ArrowDown, GitFork, Milestone, Sparkles } from "lucide-react";
import { getGlossaryTerm } from "../../data/glossary";
import type { EvolutionStage } from "../../data/lineage";
import type { Cladogram, CladogramBranch } from "../../lib/cladogram";
import { formatAgeRu } from "../../lib/timeline";
import { OptimizedImage } from "../ui/optimized-image";
import { GlossaryTerm } from "./GlossaryTerm";

export type CladogramBranchMode = "all" | "living";

type CladogramPanelProps = {
  tree: Cladogram;
  activeStage: EvolutionStage;
  activeBranch: CladogramBranch | null;
  branchMode: CladogramBranchMode;
  onChangeBranchMode: (mode: CladogramBranchMode) => void;
  onActivate: (stage: EvolutionStage) => void;
  onInspectBranch: (branch: CladogramBranch) => void;
};

export function CladogramPanel({
  tree,
  activeStage,
  activeBranch,
  branchMode,
  onChangeBranchMode,
  onActivate,
  onInspectBranch,
}: CladogramPanelProps) {
  const cladogramTerm = getGlossaryTerm("cladogram");
  const visibleBranches =
    branchMode === "living" ? tree.livingBranches : tree.branches;
  const displayedTrunk = useMemo(() => {
    if (branchMode === "all") {
      return tree.trunk;
    }

    const livingParentIds = new Set(
      tree.livingBranches.map((branch) => branch.parent.id),
    );
    const sapiensId = tree.trunk.at(-1)?.id;

    return tree.trunk.filter(
      (stage) => livingParentIds.has(stage.id) || stage.id === sapiensId,
    );
  }, [branchMode, tree.livingBranches, tree.trunk]);
  const activeBranchParentIndex = activeBranch
    ? tree.trunk.findIndex((stage) => stage.id === activeBranch.parent.id)
    : -1;
  const branchesByParent = useMemo(() => {
    const groups = new Map<string, CladogramBranch[]>();

    for (const branch of visibleBranches) {
      groups.set(branch.parent.id, [
        ...(groups.get(branch.parent.id) ?? []),
        branch,
      ]);
    }

    return groups;
  }, [visibleBranches]);

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
            Homo sapiens находится на выделенной ветви; карточки справа отвечают,
            какие общие предки связывают нас с соседними живущими и ископаемыми
            линиями.
          </p>
        </div>
      </div>

      <div className="cladogram-body">
        <div
          className="cladogram-mode-toggle"
          role="group"
          aria-label="Режим отображения ветвей"
        >
          <button
            type="button"
            aria-pressed={branchMode === "all"}
            onClick={() => onChangeBranchMode("all")}
          >
            Все ветви
          </button>
          <button
            type="button"
            aria-pressed={branchMode === "living"}
            onClick={() => onChangeBranchMode("living")}
          >
            Живущие сегодня
          </button>
        </div>

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
            Общий предок с нами
          </span>
        </div>

        <div
          className="cladogram-map"
          aria-label="Дерево родства: сверху вниз идет наша линия, вправо показаны линии от общих предков"
        >
          <div
            className={[
              "cladogram-row",
              "cladogram-root-row",
              activeBranch ? "is-in-active-path" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="cladogram-trunk-cell">
              <div className="cladogram-node cladogram-root-node">
                <span className="cladogram-node-number">00</span>
                <span className="cladogram-node-dot" aria-hidden="true" />
                <span className="cladogram-node-copy">
                  <small>корень дерева</small>
                  <strong>{tree.root.titleRu}</strong>
                  <em>около {formatAgeRu(tree.root.ageMa)}</em>
                </span>
              </div>
            </div>
            <div className="cladogram-branch-cell cladogram-root-copy">
              <Sparkles aria-hidden="true" size={18} />
              <p>{tree.root.descriptionRu}</p>
            </div>
          </div>

          {displayedTrunk.map((stage) => {
            const index = tree.trunk.findIndex((item) => item.id === stage.id);
            const branches = branchesByParent.get(stage.id) ?? [];
            const isActive = stage.id === activeStage.id;
            const isInActivePath =
              activeBranchParentIndex >= 0 && index <= activeBranchParentIndex;
            const hasActiveBranch = branches.some(
              (branch) =>
                (branchMode === "all" && branch.stage?.id === activeStage.id) ||
                branch.id === activeBranch?.id,
            );
            const rowClassName = [
              "cladogram-row",
              branches.length > 0 ? "has-branches" : "",
              isInActivePath ? "is-in-active-path" : "",
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
                      branch.isLivingComparison ? "is-living" : "",
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
                          branch.stage && branchMode === "all"
                            ? onActivate(branch.stage)
                            : onInspectBranch(branch)
                        }
                      >
                        <span className="cladogram-branch-thumb">
                          <OptimizedImage
                            src={branch.image.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        <span className="cladogram-branch-copy">
                          <small>
                            общий предок с нами:{" "}
                            {branch.commonAncestor.titleRu}
                          </small>
                          <strong>{branch.titleRu}</strong>
                          <em>
                            {formatAgeRu(branch.commonAncestor.ageMa)}
                          </em>
                          {branch.isLivingComparison ? (
                            <span className="cladogram-living-badge">
                              живут сегодня
                            </span>
                          ) : null}
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
