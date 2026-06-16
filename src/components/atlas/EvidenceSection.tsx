import { EVIDENCE_MODULES, SCIENTIFIC_THEORY_EXPLAINER } from "../../data/evidence";

export function EvidenceSection() {
  return (
    <section className="evidence-section" aria-labelledby="evidence-title">
      <div className="evidence-intro">
        <p className="eyebrow">Почему этому доверяют</p>
        <h2 id="evidence-title">Что значит “теория” в теории эволюции</h2>
        <p>{SCIENTIFIC_THEORY_EXPLAINER.bodyRu}</p>
      </div>

      <div className="evidence-grid">
        {EVIDENCE_MODULES.map(({ icon: Icon, ...module }) => (
          <article key={module.id} className="evidence-card">
            <Icon aria-hidden="true" size={24} />
            <h3>{module.titleRu}</h3>
            <p>{module.summaryRu}</p>
            <strong>{module.exampleRu}</strong>
            <a href={module.source.url} target="_blank" rel="noreferrer">
              {module.source.label}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
