import { ArrowDown, ArrowUp, CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createQuizAttempt,
  isQuizAnswerCorrect,
  scoreQuiz,
  type BranchChoiceQuizQuestion,
  type OrderQuizQuestion,
  type QuizAnswerValue,
  type QuizScoreResult,
  type SingleChoiceQuizQuestion,
} from "../../data/quiz";

export function QuizPanel() {
  const [attemptQuestions, setAttemptQuestions] = useState(() => createQuizAttempt());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState(false);
  const question = attemptQuestions[questionIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const hasSubmittedAnswer = selectedAnswer !== undefined;
  const isCurrentAnswerCorrect = question ? isQuizAnswerCorrect(question, selectedAnswer) : false;
  const result = useMemo(() => scoreQuiz(answers, attemptQuestions), [answers, attemptQuestions]);

  function selectAnswer(answer: QuizAnswerValue) {
    if (!question || hasSubmittedAnswer) {
      return;
    }
    setAnswers((current) => ({ ...current, [question.id]: answer }));
  }

  function orderFor(questionToOrder: OrderQuizQuestion) {
    return orderDrafts[questionToOrder.id] ?? questionToOrder.items.map((item) => item.id);
  }

  function moveOrderItem(questionToOrder: OrderQuizQuestion, itemIndex: number, direction: -1 | 1) {
    if (answers[questionToOrder.id] !== undefined) {
      return;
    }

    const currentOrder = orderFor(questionToOrder);
    const nextIndex = itemIndex + direction;
    if (nextIndex < 0 || nextIndex >= currentOrder.length) {
      return;
    }

    const nextOrder = [...currentOrder];
    [nextOrder[itemIndex], nextOrder[nextIndex]] = [nextOrder[nextIndex], nextOrder[itemIndex]];
    setOrderDrafts((current) => ({ ...current, [questionToOrder.id]: nextOrder }));
  }

  function submitOrder(questionToOrder: OrderQuizQuestion) {
    selectAnswer(orderFor(questionToOrder));
  }

  function moveNext() {
    if (questionIndex < attemptQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    setIsFinished(true);
  }

  function restart() {
    setAttemptQuestions(createQuizAttempt());
    setQuestionIndex(0);
    setAnswers({});
    setOrderDrafts({});
    setIsFinished(false);
  }

  return (
    <section className="quiz-panel" aria-labelledby="quiz-heading">
      <div className="quiz-heading">
        <HelpCircle aria-hidden="true" size={23} />
        <div>
          <p className="eyebrow">Короткая проверка</p>
          <h2 id="quiz-heading">10 вопросов по Атласу</h2>
          <p>Несколько быстрых вопросов, чтобы закрепить главную мысль: эволюция — это дерево родства.</p>
        </div>
      </div>

      {isFinished || !question ? (
        <QuizResult result={result} onRestart={restart} />
      ) : (
        <div className="quiz-body">
          <div className="quiz-progress" aria-live="polite">
            Вопрос {questionIndex + 1} из {attemptQuestions.length}
          </div>
          <h3>{question.promptRu}</h3>
          {question.type === "single-choice" ? (
            <SingleChoiceQuestion question={question} selectedAnswer={selectedAnswer} onSelect={selectAnswer} />
          ) : null}
          {question.type === "order" ? (
            <OrderQuestion
              question={question}
              orderIds={orderFor(question)}
              hasSubmittedAnswer={hasSubmittedAnswer}
              onMove={moveOrderItem}
              onSubmit={submitOrder}
            />
          ) : null}
          {question.type === "branch-choice" ? (
            <BranchChoiceQuestion question={question} selectedAnswer={selectedAnswer} onSelect={selectAnswer} />
          ) : null}

          {hasSubmittedAnswer ? (
            <div
              className={isCurrentAnswerCorrect ? "quiz-explanation is-correct" : "quiz-explanation is-wrong"}
              role="status"
              aria-live="polite"
            >
              <strong>{isCurrentAnswerCorrect ? "Верно" : "Не совсем"}</strong>
              <p>{question.explanationRu}</p>
            </div>
          ) : null}

          <button
            className="button button-secondary button-md"
            type="button"
            disabled={!hasSubmittedAnswer}
            onClick={moveNext}
          >
            {questionIndex === attemptQuestions.length - 1 ? "Показать результат" : "Следующий вопрос"}
          </button>
        </div>
      )}
    </section>
  );
}

function SingleChoiceQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: SingleChoiceQuizQuestion;
  selectedAnswer: QuizAnswerValue | undefined;
  onSelect: (answer: QuizAnswerValue) => void;
}) {
  const selectedOptionId = typeof selectedAnswer === "string" ? selectedAnswer : undefined;
  const showState = selectedAnswer !== undefined;

  return (
    <div className="quiz-options">
      {question.options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        const className = [
          "quiz-option",
          isSelected ? "is-selected" : "",
          showState && option.isCorrect ? "is-correct" : "",
          showState && isSelected && !option.isCorrect ? "is-wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={option.id}
            className={className}
            type="button"
            aria-disabled={showState}
            disabled={showState}
            onClick={() => onSelect(option.id)}
          >
            {showState && option.isCorrect ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
            {showState && isSelected && !option.isCorrect ? <XCircle aria-hidden="true" size={17} /> : null}
            {showState && option.isCorrect ? <span className="sr-only">Верный ответ: </span> : null}
            {showState && isSelected && !option.isCorrect ? <span className="sr-only">Ваш ответ неверен: </span> : null}
            <span>{option.textRu}</span>
          </button>
        );
      })}
    </div>
  );
}

function OrderQuestion({
  question,
  orderIds,
  hasSubmittedAnswer,
  onMove,
  onSubmit,
}: {
  question: OrderQuizQuestion;
  orderIds: string[];
  hasSubmittedAnswer: boolean;
  onMove: (question: OrderQuizQuestion, itemIndex: number, direction: -1 | 1) => void;
  onSubmit: (question: OrderQuizQuestion) => void;
}) {
  return (
    <div className="quiz-order">
      <p className="quiz-instruction">{question.instructionRu}</p>
      <ol className="quiz-order-list">
        {orderIds.map((itemId, index) => {
          const item = question.items.find((candidate) => candidate.id === itemId);
          if (!item) return null;

          return (
            <li key={item.id} className="quiz-order-item">
              <span className="quiz-order-index">{index + 1}</span>
              <span>{item.textRu}</span>
              <div className="quiz-order-controls">
                <button
                  type="button"
                  aria-label={`Поднять ${item.textRu}`}
                  disabled={hasSubmittedAnswer || index === 0}
                  onClick={() => onMove(question, index, -1)}
                >
                  <ArrowUp aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Опустить ${item.textRu}`}
                  disabled={hasSubmittedAnswer || index === orderIds.length - 1}
                  onClick={() => onMove(question, index, 1)}
                >
                  <ArrowDown aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        className="button button-secondary button-md"
        type="button"
        disabled={hasSubmittedAnswer}
        aria-disabled={hasSubmittedAnswer}
        onClick={() => onSubmit(question)}
      >
        Проверить
      </button>
    </div>
  );
}

function BranchChoiceQuestion({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: BranchChoiceQuizQuestion;
  selectedAnswer: QuizAnswerValue | undefined;
  onSelect: (answer: QuizAnswerValue) => void;
}) {
  const selectedNodeId = typeof selectedAnswer === "string" ? selectedAnswer : undefined;
  const showState = selectedAnswer !== undefined;

  return (
    <div className="quiz-branch">
      <p className="quiz-instruction">{question.instructionRu}</p>
      <div className="quiz-branch-options">
        {question.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isCorrect = node.id === question.correctNodeId;
          const className = [
            "quiz-branch-node",
            isSelected ? "is-selected" : "",
            showState && isCorrect ? "is-correct" : "",
            showState && isSelected && !isCorrect ? "is-wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={node.id}
              className={className}
              type="button"
              aria-disabled={showState}
              disabled={showState}
              onClick={() => onSelect(node.id)}
            >
              {showState && isCorrect ? <span className="sr-only">Верный ответ: </span> : null}
              {showState && isSelected && !isCorrect ? <span className="sr-only">Ваш ответ неверен: </span> : null}
              <strong>{node.textRu}</strong>
              <span>{node.detailRu}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizResult({ result, onRestart }: { result: QuizScoreResult; onRestart: () => void }) {
  const hasRecommendations = result.recommendedTopics.length > 0;
  const isPerfect = result.correct === result.total;
  const darwinTitle = isPerfect
    ? "Мистер Дарвин снимает шляпу"
    : result.correct >= 8
      ? "Дарвин доволен вашей наблюдательностью"
      : result.correct >= 5
        ? "Дарвин видит рабочую гипотезу"
        : "Дарвин предлагает вернуться к наблюдениям";
  const darwinCopy = isPerfect
    ? "Особенная благодарность от Дарвина: вы уверенно видите, что жизнь ветвится, наследует и меняется."
    : "Ошибки здесь полезны: они показывают, какие ветви дерева стоит рассмотреть внимательнее.";

  return (
    <div className="quiz-result">
      <CheckCircle2 aria-hidden="true" size={28} />
      <h3>Оценка Дарвина</h3>
      <strong>
        Ваш результат: {result.correct} из {result.total}
      </strong>
      <div className={isPerfect ? "quiz-darwin-note is-perfect" : "quiz-darwin-note"}>
        <strong>{darwinTitle}</strong>
        <p>{darwinCopy}</p>
      </div>

      <section className="quiz-route" aria-labelledby="quiz-route-heading">
        <h3 id="quiz-route-heading">Ваш маршрут</h3>
        {hasRecommendations ? (
          <div className="quiz-route-grid">
            {result.recommendedTopics.map((topic) => (
              <article key={topic.id} className="quiz-route-card">
                <strong>{topic.titleRu}</strong>
                <p>{topic.practiceRu}</p>
                <div className="quiz-route-links">
                  {topic.links.map((link) => (
                    <Link key={link.href} to={link.href}>
                      {link.labelRu}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="quiz-route-perfect">
            <strong>Вы уверенно видите дерево родства.</strong>
            <p>Можно идти глубже: сравнить ветви, молекулярные следы и материалы для закрепления.</p>
            <div className="quiz-route-links">
              <Link to="/cladogram">Дерево родства</Link>
              <Link to="/genetics">РНК/ДНК</Link>
              <Link to="/materials">Материалы</Link>
            </div>
          </div>
        )}
      </section>

      <button className="button button-secondary button-md" type="button" onClick={onRestart}>
        <RotateCcw aria-hidden="true" size={17} />
        Пройти ещё раз
      </button>
    </div>
  );
}
