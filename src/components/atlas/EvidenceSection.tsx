import { EVIDENCE_MODULES, SCIENTIFIC_THEORY_EXPLAINER } from "../../data/evidence";

const FREQUENT_QUESTIONS = [
  {
    question: "Эволюцию можно наблюдать сегодня?",
    answer:
      "Да. Наследуемые изменения наблюдают у бактерий, насекомых, растений и других организмов — иногда за считанные поколения.",
  },
  {
    question: "Есть ли переходные формы?",
    answer:
      "Да. Известны ископаемые с сочетанием признаков соседних ветвей, а их возраст и строение совпадают с предсказаниями эволюции.",
  },
  {
    question: "Что показывает сравнение ДНК?",
    answer:
      "Родственные виды разделяют последовательности и редкие мутации. Независимые участки генома обычно восстанавливают согласующееся дерево родства.",
  },
  {
    question: "Почему это всё ещё теория?",
    answer:
      "В науке теория не становится «законом»: факты описывают наблюдения, а теория объясняет их и позволяет проверять новые предсказания.",
  },
] as const;

export function EvidenceSection() {
  return (
    <section className="evidence-section" aria-labelledby="evidence-title">
      <div className="evidence-intro">
        <p className="eyebrow">Почему этому доверяют</p>
        <h2 id="evidence-title">Какие доказательства подтверждают эволюцию</h2>
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

      <div className="evidence-faq" aria-label="Короткие ответы на частые вопросы об эволюции">
        {FREQUENT_QUESTIONS.map(({ question, answer }) => (
          <article key={question} className="evidence-faq-card">
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
