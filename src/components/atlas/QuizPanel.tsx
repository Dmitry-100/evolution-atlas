import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { QUIZ_QUESTIONS, scoreQuiz } from "../../data/quiz";

export function QuizPanel() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const question = QUIZ_QUESTIONS[questionIndex];
  const selectedOptionId = question ? answers[question.id] : undefined;
  const selectedOption = question?.options.find((option) => option.id === selectedOptionId);
  const result = useMemo(() => scoreQuiz(answers), [answers]);

  function selectOption(optionId: string) {
    if (!question || selectedOptionId) {
      return;
    }
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
  }

  function moveNext() {
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    setIsFinished(true);
  }

  function restart() {
    setQuestionIndex(0);
    setAnswers({});
    setIsFinished(false);
  }

  return (
    <section className="quiz-panel" aria-labelledby="quiz-heading">
      <div className="quiz-heading">
        <HelpCircle aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Мини-квиз</p>
          <h2 id="quiz-heading">Проверь себя</h2>
          <p>Несколько быстрых вопросов, чтобы закрепить главную мысль: эволюция — это дерево родства.</p>
        </div>
      </div>

      {isFinished || !question ? (
        <div className="quiz-result">
          <CheckCircle2 aria-hidden="true" size={28} />
          <strong>
            Ваш результат: {result.correct} из {result.total}
          </strong>
          <p>Самое важное — не баллы, а новая привычка видеть ветви, а не лестницу.</p>
          <button className="button button-secondary button-md" type="button" onClick={restart}>
            <RotateCcw aria-hidden="true" size={17} />
            Пройти ещё раз
          </button>
        </div>
      ) : (
        <div className="quiz-body">
          <div className="quiz-progress">
            Вопрос {questionIndex + 1} из {QUIZ_QUESTIONS.length}
          </div>
          <h3>{question.promptRu}</h3>
          <div className="quiz-options">
            {question.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const showState = Boolean(selectedOptionId);
              const className = [
                "quiz-option",
                isSelected ? "is-selected" : "",
                showState && option.isCorrect ? "is-correct" : "",
                showState && isSelected && !option.isCorrect ? "is-wrong" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button key={option.id} className={className} type="button" onClick={() => selectOption(option.id)}>
                  {showState && option.isCorrect ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
                  {showState && isSelected && !option.isCorrect ? <XCircle aria-hidden="true" size={17} /> : null}
                  <span>{option.textRu}</span>
                </button>
              );
            })}
          </div>

          {selectedOption ? (
            <div className={selectedOption.isCorrect ? "quiz-explanation is-correct" : "quiz-explanation is-wrong"}>
              <strong>{selectedOption.isCorrect ? "Верно" : "Не совсем"}</strong>
              <p>{question.explanationRu}</p>
            </div>
          ) : null}

          <button className="button button-secondary button-md" type="button" disabled={!selectedOption} onClick={moveNext}>
            {questionIndex === QUIZ_QUESTIONS.length - 1 ? "Показать результат" : "Следующий вопрос"}
          </button>
        </div>
      )}
    </section>
  );
}
