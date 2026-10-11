"use client";

import { useState } from "react";
import { download, slug, toMarkdown } from "@/lib/export";
import { LEVELS, type Quiz } from "@/lib/types";

const L = ["A", "B", "C", "D"];

export default function QuizView({ quiz, dim }: { quiz: Quiz; dim?: boolean }) {
  const [mode, setMode] = useState<"take" | "key">("take");
  const [picks, setPicks] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [copied, setCopied] = useState(false);

  const answered = picks.filter((p) => p !== null).length;
  const correct = picks.filter((p, i) => p === quiz.questions[i].answer).length;
  const finished = answered === quiz.questions.length;

  async function copy() {
    await navigator.clipboard.writeText(toMarkdown(quiz));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className={`mt-12 transition-opacity ${dim ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="num text-[11px] uppercase tracking-[0.16em] text-muted">
            {quiz.questions.length} questions · {LEVELS[quiz.difficulty].label}
          </p>
          <h2 className="mt-2 font-display text-[40px] leading-none sm:text-[52px]">{quiz.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex rounded-full bg-wash p-0.5">
            {(["take", "key"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-full px-3.5 py-1 text-[13px] transition-all ${
                  mode === m ? "bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-muted hover:text-ink"
                }`}
              >
                {m === "take" ? "Take quiz" : "Answer key"}
              </button>
            ))}
          </div>
          <Action onClick={copy}>{copied ? "Copied" : "Copy"}</Action>
          <Action onClick={() => download(`${slug(quiz.title)}.md`, toMarkdown(quiz))}>Download .md</Action>
          <Action onClick={() => window.print()}>Print</Action>
        </div>
      </div>

      {mode === "take" && (
        <div className="sticky top-0 z-10 -mx-5 mt-6 border-b border-line bg-paper/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 print:hidden">
          <div className="flex items-center gap-4">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-wash">
              <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${(answered / quiz.questions.length) * 100}%` }} />
            </div>
            <p className="num text-xs text-muted">
              {answered}/{quiz.questions.length} answered · <span className="text-ok">{correct} correct</span>
            </p>
          </div>
        </div>
      )}

      <ol className="mt-6 space-y-4">
        {quiz.questions.map((q, i) => {
          const pick = mode === "key" ? q.answer : picks[i];
          const locked = pick !== null;
          return (
            <li
              key={i}
              className="rise relative rounded-2xl border border-line bg-card p-5 break-inside-avoid before:absolute before:inset-y-0 before:left-[56px] before:w-px before:bg-pen/30 sm:p-7 sm:before:left-[64px] print:border-0 print:p-0 print:py-3 print:before:hidden"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div className="flex gap-4">
                <span className="num w-7 shrink-0 pt-1 text-xs text-pen/80">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-medium leading-snug">{q.question}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, j) => {
                      const isAnswer = j === q.answer;
                      const isPick = j === pick;
                      const state = !locked ? "idle" : isAnswer ? "right" : isPick ? "wrong" : "rest";
                      return (
                        <button
                          key={j}
                          disabled={locked || mode === "key"}
                          onClick={() => setPicks((p) => p.map((v, k) => (k === i ? j : v)))}
                          className={`flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[15px] transition-colors print:border-0 print:p-0 ${
                            {
                              idle: "border-line hover:border-ink hover:bg-paper",
                              right: "border-ok/40 bg-ok-soft print:bg-transparent",
                              wrong: "border-pen/40 bg-pen-soft",
                              rest: "border-line text-faint",
                            }[state]
                          }`}
                        >
                          <span
                            className={`num mt-px grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                              state === "right" ? "border-ok bg-ok text-white print:bg-transparent print:text-ink" : state === "wrong" ? "border-pen bg-pen text-white" : "border-line"
                            }`}
                          >
                            {L[j]}
                          </span>
                          <span className={state === "wrong" ? "line-through decoration-pen/60" : ""}>{o}</span>
                        </button>
                      );
                    })}
                  </div>
                  {locked && (
                    <div className="mt-4 border-l-2 border-line pl-4 text-[14px] leading-relaxed text-muted print:hidden">
                      <p>
                        {mode === "take" && (
                          <span className={pick === q.answer ? "text-ok" : "text-pen"}>
                            {pick === q.answer ? "Correct. " : `The answer is ${L[q.answer]}. `}
                          </span>
                        )}
                        {q.explanation}
                      </p>
                      {q.quote && <p className="mt-1.5 font-display text-[17px] italic text-ink/80">&ldquo;{q.quote}&rdquo;</p>}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {mode === "take" && finished && (
        <div className="rise mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink px-6 py-6 text-paper sm:px-8 print:hidden">
          <div>
            <p className="font-display text-[44px] leading-none">
              {correct}
              <span className="text-paper/50">/{quiz.questions.length}</span>
            </p>
            <p className="mt-2 text-[14px] text-paper/70">
              {correct === quiz.questions.length
                ? "Clean sweep."
                : `Review the ${quiz.questions.length - correct} you missed above, then try again.`}
            </p>
          </div>
          <button
            onClick={() => setPicks(quiz.questions.map(() => null))}
            className="rounded-full bg-paper px-5 py-2 text-[14px] text-ink"
          >
            Retake
          </button>
        </div>
      )}

      <div className="hidden print:block">
        <h3 className="mt-8 border-t border-line pt-4 font-display text-2xl">Answer key</h3>
        <ol className="mt-2 space-y-1 text-[13px]">
          {quiz.questions.map((q, i) => (
            <li key={i}>
              {i + 1}. <strong>{L[q.answer]}</strong> — {q.explanation}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-full border border-line px-3.5 py-1 text-[13px] text-muted transition-colors hover:border-ink hover:text-ink">
      {children}
    </button>
  );
}
