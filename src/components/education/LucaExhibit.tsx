import { Atom, ExternalLink, GitFork, Network } from "lucide-react";
import { useState } from "react";
import { LUCA_EXHIBIT, LUCA_INHERITANCE, LUCA_SOURCES, LUCA_TREE_NODES, type LucaTreeNodeId } from "../../data/luca";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { GlossaryTermById } from "./GlossaryTerm";

export function LucaExhibit() {
  const [activeNodeId, setActiveNodeId] = useState<LucaTreeNodeId>("luca");
  const rootNode = LUCA_TREE_NODES.find((node) => node.id === "luca") ?? LUCA_TREE_NODES[0];
  const activeNode = LUCA_TREE_NODES.find((node) => node.id === activeNodeId) ?? LUCA_TREE_NODES[0];
  const topLevelNodeIds = new Set(rootNode.children ?? []);
  const topLevelNodes = LUCA_TREE_NODES.filter((node) => topLevelNodeIds.has(node.id));
  const getChildNodes = (node: (typeof LUCA_TREE_NODES)[number]) =>
    LUCA_TREE_NODES.filter((candidate) => node.children?.includes(candidate.id));

  return (
    <section
      className="luca-exhibit"
      aria-labelledby="luca-exhibit-title"
      data-tour-stop-id="page-origin-luca"
    >
      <div className="luca-exhibit-heading">
        <Network aria-hidden="true" size={24} />
        <div>
          <p className="eyebrow">{LUCA_EXHIBIT.eyebrowRu}</p>
          <h2 id="luca-exhibit-title">{LUCA_EXHIBIT.titleRu}</h2>
          <p>{LUCA_EXHIBIT.leadRu}</p>
          <p className="luca-acronym">
            <GlossaryTermById id="luca">LUCA</GlossaryTermById> ={" "}
            <span>{LUCA_EXHIBIT.acronymEn}</span> — {LUCA_EXHIBIT.acronymRu}.
          </p>
        </div>
        <ConfidenceBadge level={LUCA_EXHIBIT.confidence} />
      </div>

      <div className="luca-exhibit-grid">
        <div className="luca-tree" aria-label="Мини-дерево LUCA в современной двухдоменной рамке">
          <button
            type="button"
            className={activeNodeId === "luca" ? "luca-root is-active" : "luca-root"}
            onClick={() => setActiveNodeId("luca")}
          >
            <Atom aria-hidden="true" size={22} />
            <strong>LUCA</strong>
            <span>{LUCA_EXHIBIT.ageRu}</span>
          </button>

          <div className="luca-branches">
            {topLevelNodes.map((node) => (
              <div key={node.id} className="luca-branch-group">
                <button
                  type="button"
                  className={node.id === activeNodeId ? "luca-branch is-active" : "luca-branch"}
                  onClick={() => setActiveNodeId(node.id)}
                >
                  <GitFork aria-hidden="true" size={17} />
                  <strong>{node.titleRu}</strong>
                  <span>{node.subtitleRu}</span>
                </button>
                {getChildNodes(node).map((childNode) => (
                  <button
                    key={childNode.id}
                    type="button"
                    className={
                      childNode.id === activeNodeId
                        ? "luca-branch luca-branch--nested is-active"
                        : "luca-branch luca-branch--nested"
                    }
                    onClick={() => setActiveNodeId(childNode.id)}
                  >
                    <GitFork aria-hidden="true" size={17} />
                    <strong>{childNode.titleRu}</strong>
                    <span>{childNode.subtitleRu}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <article className="luca-detail" aria-live="polite">
          <div className="luca-detail-kicker">
            <span>{activeNode.subtitleRu}</span>
            <ConfidenceBadge level={activeNode.confidence} />
          </div>
          <h3>{activeNode.titleRu}</h3>
          <p>{activeNode.bodyRu}</p>
          <div className="luca-inheritance">
            <strong>Что дошло до живого мира</strong>
            <div>
              {(activeNode.id === "luca" ? LUCA_INHERITANCE : activeNode.inheritedRu).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <a href={activeNode.source.url} target="_blank" rel="noreferrer">
            {activeNode.source.label}
            <ExternalLink aria-hidden="true" size={14} />
          </a>
        </article>
      </div>

      <div className="luca-note">
        <p>{LUCA_EXHIBIT.noteRu}</p>
        <div>
          {LUCA_SOURCES.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
              <ExternalLink aria-hidden="true" size={13} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
