import { ArrowRight, ChevronDown, Layers3, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import type { AccumulatedTraitGroup } from "../../lib/accumulatedTraits";

type TraitAccumulatorProps = {
  groups: AccumulatedTraitGroup[];
};

const FEATURED_TRAIT_COUNT = 8;
const GROUP_PREVIEW_COUNT = 3;

export function TraitAccumulator({ groups }: TraitAccumulatorProps) {
  const traitCount = groups.reduce((sum, group) => sum + group.traits.length, 0);
  const featuredTraits = groups.flatMap((group) => group.traits).slice(-FEATURED_TRAIT_COUNT);

  return (
    <section className="trait-accumulator" data-trait-count={traitCount} aria-labelledby="trait-accumulator-heading">
      <div className="trait-accumulator-heading">
        <Layers3 aria-hidden="true" size={23} />
        <div>
          <h2 id="trait-accumulator-heading">Карта признаков</h2>
          <p>Новые признаки не заменяют старые, а надстраиваются поверх древнего наследия.</p>
        </div>
        <div className="trait-accumulator-actions">
          <strong className="trait-total">
            <span>{traitCount}</span>
            <small>признаков</small>
          </strong>
          <Link
            className="button button-secondary button-sm trait-map-link"
            to="/body-map"
          >
            <ScanSearch aria-hidden="true" size={15} />
            Карта признаков
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>

      <div className="trait-compact-body">
        <div className="trait-featured">
          <span>Ключевые сейчас</span>
          <div className="trait-featured-chips">
            {featuredTraits.map((trait) => (
              <span key={trait}>{trait}</span>
            ))}
          </div>
        </div>

        <div className="trait-groups" aria-label="Группы унаследованных признаков">
          {groups.map((group) => {
            const previewTraits = group.traits.slice(0, GROUP_PREVIEW_COUNT);
            const hiddenCount = Math.max(0, group.traits.length - previewTraits.length);

            return (
              <details key={group.id} className="trait-group-details">
                <summary>
                  <span className="trait-group-title">
                    <strong>{group.titleRu}</strong>
                    <small>{group.traits.length} признаков</small>
                  </span>
                  <span className="trait-group-preview" aria-hidden="true">
                    {previewTraits.map((trait) => (
                      <span key={trait}>{trait}</span>
                    ))}
                    {hiddenCount > 0 ? <em>+{hiddenCount}</em> : null}
                  </span>
                  <ChevronDown aria-hidden="true" size={17} />
                </summary>

                <div className="trait-detail-chips">
                  {group.traits.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
