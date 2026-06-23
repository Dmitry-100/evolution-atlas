import { BatteryCharging, Clock3, Ear, ExternalLink, Feather, GitMerge, Shield, Waves, Wind, type LucideIcon } from "lucide-react";
import { CURIOSITY_FACTS } from "../../data/curiosityFacts";
import { ConfidenceBadge } from "./ConfidenceBadge";

const factIcons: Record<string, LucideIcon> = {
  "oxygen-waste": Wind,
  "mitochondria-bacteria": BatteryCharging,
  "jaw-to-ear": Ear,
  "chromosome-2": GitMerge,
  "viral-fossils": Shield,
  "walking-whales": Waves,
  "feathers-before-flight": Feather,
  "sapiens-last-seconds": Clock3,
};

type CuriosityFactsProps = {
  factIds?: readonly string[];
  eyebrow?: string;
  title?: string;
  description?: string;
  headingId?: string;
};

export function CuriosityFacts({
  factIds,
  eyebrow = "Неожиданный факт",
  title = "Эволюция интереснее школьных упрощений",
  description = "Короткие факты, которые показывают эволюцию как сеть реконструкций, следов и старых структур с новыми ролями.",
  headingId = "curiosity-facts-title",
}: CuriosityFactsProps) {
  const facts = factIds
    ? CURIOSITY_FACTS.filter((fact) => factIds.includes(fact.id))
    : CURIOSITY_FACTS;

  if (facts.length === 0) return null;

  return (
    <section className="curiosity-facts" aria-labelledby={headingId}>
      <div className="curiosity-facts-heading">
        <Clock3 aria-hidden="true" size={24} />
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="curiosity-facts-grid">
        {facts.map((fact) => {
          const Icon = factIcons[fact.id] ?? Clock3;
          return (
            <article key={fact.id} className="curiosity-card">
              <div className="curiosity-card-top">
                <Icon aria-hidden="true" size={23} />
                <ConfidenceBadge level={fact.confidence} />
              </div>
              <h3>{fact.titleRu}</h3>
              <p>{fact.shortRu}</p>
              <small>{fact.detailRu}</small>
              <div className="curiosity-card-actions">
                <a href={fact.sectionHref}>Открыть в атласе</a>
                <a href={fact.source.url} target="_blank" rel="noreferrer">
                  Источник
                  <ExternalLink aria-hidden="true" size={13} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
