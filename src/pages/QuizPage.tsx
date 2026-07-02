import { QuizPanel } from "../components/atlas/QuizPanel";

export function QuizPage() {
  return (
    <section className="quiz-page" data-tour-stop-id="page-quiz">
      <div className="document-header">
        <p className="eyebrow">10 вопросов</p>
        <h1>Проверь себя</h1>
        <p>
          Несколько коротких вопросов, чтобы закрепить главную мысль: эволюция ветвится, а соседние линии не
          превращаются в ступени к человеку.
        </p>
      </div>

      <QuizPanel />
    </section>
  );
}
