import { describe, expect, it } from "vitest";
import { QUIZ_QUESTIONS, scoreQuiz } from "./quiz";

describe("quiz data", () => {
  it("starts with the atlas hook question", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(36);
    expect(QUIZ_QUESTIONS[0]?.promptRu).toMatch(/от кого произошла обезьяна/i);
    expect(QUIZ_QUESTIONS[0]?.options.some((option) => option.isCorrect)).toBe(true);
  });

  it("contains a broad, valid question bank", () => {
    const ids = new Set(QUIZ_QUESTIONS.map((question) => question.id));
    expect(ids.size).toBe(QUIZ_QUESTIONS.length);

    for (const question of QUIZ_QUESTIONS) {
      expect(question.promptRu.trim().length).toBeGreaterThan(20);
      expect(question.explanationRu.trim().length).toBeGreaterThan(30);
      expect(question.options).toHaveLength(3);
      expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(3);
    }

    const prompts = QUIZ_QUESTIONS.map((question) => question.promptRu).join(" ");
    expect(prompts).toMatch(/динозавр/i);
    expect(prompts).toMatch(/вымира/i);
    expect(prompts).toMatch(/Дарвин/i);
    expect(prompts).toMatch(/теори/i);
  });

  it("scores selected answers", () => {
    const answers = Object.fromEntries(QUIZ_QUESTIONS.map((question) => [question.id, question.options.find((option) => option.isCorrect)!.id]));

    expect(scoreQuiz(answers)).toEqual({
      correct: QUIZ_QUESTIONS.length,
      total: QUIZ_QUESTIONS.length,
    });
  });
});
