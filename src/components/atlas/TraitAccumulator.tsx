import { Layers3 } from "lucide-react";
import type { AccumulatedTraitGroup } from "../../lib/accumulatedTraits";

type TraitAccumulatorProps = {
  groups: AccumulatedTraitGroup[];
};

export function TraitAccumulator({ groups }: TraitAccumulatorProps) {
  const traitCount = groups.reduce((sum, group) => sum + group.traits.length, 0);

  return (
    <section className="trait-accumulator" data-trait-count={traitCount} aria-labelledby="trait-accumulator-heading">
      <div className="trait-accumulator-heading">
        <Layers3 aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Накопитель признаков</p>
          <h2 id="trait-accumulator-heading">К этому моменту вы уже унаследовали</h2>
          <p>
            Двигайтесь по шкале: список растет, потому что новые признаки не заменяют старые, а надстраиваются поверх
            древнего клеточного, телесного и поведенческого наследия.
          </p>
        </div>
        <strong className="trait-total">{traitCount}</strong>
      </div>

      <div className="trait-groups">
        {groups.map((group) => (
          <article key={group.id} className="trait-group">
            <h3>{group.titleRu}</h3>
            <div>
              {group.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
