export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  quote?: string;
};

export type Quiz = { title: string; difficulty: Difficulty; questions: Question[] };

export const LEVELS: Record<Difficulty, { label: string; audience: string }> = {
  easy: { label: "Easy", audience: "elementary school" },
  medium: { label: "Medium", audience: "high school" },
  hard: { label: "Hard", audience: "college" },
};

export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_TEXT_CHARS = 100_000;
export const MAX_QUESTIONS = 25;

export const ACCEPT: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "text/plain": "Text",
  "text/markdown": "Markdown",
};
