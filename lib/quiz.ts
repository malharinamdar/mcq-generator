import type { Difficulty, Question } from "./types";
import { LEVELS } from "./types";

export const SYSTEM = `You write multiple-choice questions for teachers and students.

Rules:
- Ground every question in the supplied material only. Never test facts that are not in it.
- Exactly four options per question and exactly one correct option. "answer" is the 0-based index of the correct option.
- Distractors must be plausible to someone who skimmed the material, similar in length and grammatical form to the answer, and clearly wrong to someone who read carefully.
- No "all of the above", "none of the above", "both A and B", negatively phrased stems, or trick wording.
- Cover different parts of the material; no two questions may test the same fact.
- Mix recall, understanding and application. Harder levels lean on inference and connecting ideas.
- "explanation": one or two sentences on why the answer is correct.
- "quote": a short verbatim phrase (at most 20 words) from the material that supports the answer.
- "title": a short title for the material, at most six words.
- If the material is too short for the requested number, return as many good questions as it supports.`;

export function userPrompt(count: number, difficulty: Difficulty) {
  const { label, audience } = LEVELS[difficulty];
  return `Write ${count} multiple-choice questions at ${label.toLowerCase()} difficulty, pitched at ${audience} students, from the material provided.`;
}

export const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "questions"],
  properties: {
    title: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answer", "explanation", "quote"],
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answer: { type: "integer" },
          explanation: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
  },
};

/** Drop malformed items and shuffle options so the answer isn't biased toward one letter. */
export function clean(raw: unknown, count: number): Question[] {
  const list = (raw as { questions?: unknown[] })?.questions;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const item of list) {
    const q = item as Partial<Question>;
    const question = typeof q.question === "string" ? q.question.trim() : "";
    const options = Array.isArray(q.options) ? q.options.map((o) => String(o).trim()) : [];
    const answer = Number(q.answer);
    if (!question || options.length !== 4 || options.some((o) => !o)) continue;
    if (new Set(options.map((o) => o.toLowerCase())).size !== 4) continue;
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) continue;
    if (seen.has(question.toLowerCase())) continue;
    seen.add(question.toLowerCase());

    const order = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    out.push({
      question,
      options: order.map((i) => options[i]),
      answer: order.indexOf(answer),
      explanation: String(q.explanation ?? "").trim(),
      quote: typeof q.quote === "string" && q.quote.trim() ? q.quote.trim() : undefined,
    });
  }
  return out.slice(0, count);
}
