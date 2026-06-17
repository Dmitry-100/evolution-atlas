export type QuizOption = {
  id: string;
  textRu: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  promptRu: string;
  explanationRu: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "monkey-origin",
    promptRu: "А от кого произошла обезьяна?",
    explanationRu: "Не от современных обезьян, а от более древних приматов. Современные обезьяны — наши родственники на соседних ветвях.",
    options: [
      { id: "early-primates", textRu: "От более ранних приматов", isCorrect: true },
      { id: "modern-chimp", textRu: "От современных шимпанзе", isCorrect: false },
      { id: "dinosaurs", textRu: "От динозавров", isCorrect: false },
    ],
  },
  {
    id: "deep-time",
    promptRu: "Если 4 млрд лет истории жизни сжать в один год, когда появляются приматы?",
    explanationRu: "Приматы появляются только в конце декабря. Это и есть масштаб глубокого времени.",
    options: [
      { id: "late-december", textRu: "В конце декабря", isCorrect: true },
      { id: "march", textRu: "В марте", isCorrect: false },
      { id: "july", textRu: "В июле", isCorrect: false },
    ],
  },
  {
    id: "fish-to-limbs",
    promptRu: "Какая идея лучше всего объясняет переход плавника к конечности?",
    explanationRu: "Конечность не появляется с нуля: она перестраивает старую архитектуру плавника и опоры.",
    options: [
      { id: "remodeling", textRu: "Постепенная перестройка старой структуры", isCorrect: true },
      { id: "instant", textRu: "Мгновенное появление готовой ноги", isCorrect: false },
      { id: "choice", textRu: "Сознательный выбор организма", isCorrect: false },
    ],
  },
  {
    id: "neanderthals",
    promptRu: "Неандертальцы были нашими прямыми предками?",
    explanationRu: "Скорее близкая боковая ветвь людей. Homo sapiens частично смешивался с ними, но это не лестница 'ниже-выше'.",
    options: [
      { id: "side-branch", textRu: "Нет, это близкая боковая ветвь", isCorrect: true },
      { id: "apes", textRu: "Да, это древние обезьяны", isCorrect: false },
      { id: "dinosaurs", textRu: "Нет, это динозавры", isCorrect: false },
    ],
  },
];

export function scoreQuiz(answers: Record<string, string>) {
  const correct = QUIZ_QUESTIONS.filter((question) => {
    const selectedOption = question.options.find((option) => option.id === answers[question.id]);
    return selectedOption?.isCorrect === true;
  }).length;

  return {
    correct,
    total: QUIZ_QUESTIONS.length,
  };
}
