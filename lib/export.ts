import type { Quiz } from "./types";
import { LEVELS } from "./types";

const L = ["A", "B", "C", "D"];

export function toMarkdown(quiz: Quiz) {
  const lines = [`# ${quiz.title}`, "", `${quiz.questions.length} questions · ${LEVELS[quiz.difficulty].label}`, ""];
  quiz.questions.forEach((q, i) => {
    lines.push(`**${i + 1}. ${q.question}**`, "");
    q.options.forEach((o, j) => lines.push(`- ${L[j]}. ${o}`));
    lines.push("");
  });
  lines.push("---", "", "## Answer key", "");
  quiz.questions.forEach((q, i) => lines.push(`${i + 1}. **${L[q.answer]}** — ${q.explanation}`));
  return lines.join("\n");
}

export function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "quiz";
}
