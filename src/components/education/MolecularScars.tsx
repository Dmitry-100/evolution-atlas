import { Binary, ExternalLink, GitMerge, ShieldCheck, type LucideIcon } from "lucide-react";
import { MOLECULAR_MARKERS } from "../../data/genetics";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { GlossaryTermById } from "./GlossaryTerm";

const markerIcons: Record<string, LucideIcon> = {
  "shared-code": Binary,
  "chromosome-2": GitMerge,
  "viral-fossils": ShieldCheck,
};

export function MolecularScars() {
  return (
    <section className="molecular-scars" aria-labelledby="molecular-scars-title">
      <div className="genetics-section-heading">
        <GitMerge aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Молекулярные шрамы</p>
          <h2 id="molecular-scars-title">Следы конкретных событий</h2>
          <p>
            Некоторые доказательства особенно сильны, потому что похожи на редкие исторические метки: общий переводчик,
            <GlossaryTermById id="chromosome-2">слияние хромосом</GlossaryTermById>{" "}
            и{" "}
            <GlossaryTermById id="endogenous-retroviruses">
              наследуемые вирусные вставки
            </GlossaryTermById>.
          </p>
        </div>
      </div>

      <div className="molecular-scars-grid">
        {MOLECULAR_MARKERS.map((marker) => {
          const Icon = markerIcons[marker.id] ?? GitMerge;
          return (
            <article key={marker.id} className="molecular-scar-card">
              <div>
                <Icon aria-hidden="true" size={24} />
                <ConfidenceBadge level={marker.confidence} />
              </div>
              <span>{marker.markerRu}</span>
              <h3>{marker.titleRu}</h3>
              <p>{marker.explanationRu}</p>
              <a href={marker.source.url} target="_blank" rel="noreferrer">
                {marker.source.label}
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
