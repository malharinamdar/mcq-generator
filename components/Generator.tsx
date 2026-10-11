"use client";

import { useEffect, useRef, useState } from "react";
import { ACCEPT, LEVELS, MAX_FILE_BYTES, MAX_QUESTIONS, MAX_TEXT_CHARS, type Difficulty, type Quiz } from "@/lib/types";
import QuizView from "./QuizView";

type Tab = "upload" | "paste";

const COUNTS = [5, 10, 15, 20];

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function Generator() {
  const [tab, setTab] = useState<Tab>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [count, setCount] = useState(10);
  const [countDraft, setCountDraft] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [editing, setEditing] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  function pick(f: File | undefined) {
    if (!f) return;
    const type = f.type || (f.name.endsWith(".md") ? "text/markdown" : "");
    if (!ACCEPT[type]) return setError("Upload a PDF, an image (PNG, JPEG, WebP) or a text file.");
    if (f.size > MAX_FILE_BYTES) return setError(`That file is ${size(f.size)}. The limit is 4 MB.`);
    setError(null);
    setFile(f);
  }

  async function loadSample() {
    const res = await fetch("/samples/egypt.txt");
    setText(await res.text());
    setTab("paste");
    setError(null);
  }

  const ready = tab === "upload" ? !!file : text.trim().length >= 200;

  async function generate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ready || loading) return;
    setLoading(true);
    setError(null);
    const body = new FormData();
    body.set("count", String(count));
    body.set("difficulty", difficulty);
    if (tab === "upload" && file) body.set("file", file);
    else body.set("text", text);
    try {
      const res = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
      if (!res.ok) throw new Error(data.error);
      setQuiz(data);
      setEditing(false);
      requestAnimationFrame(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const source = tab === "upload" ? file?.name : `${text.trim().length.toLocaleString()} characters of text`;

  return (
    <>
      {!editing && quiz ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4 print:hidden">
          <p className="text-[14px] text-muted">
            <span className="text-ink">{source}</span> <span className="text-faint">·</span> {quiz.questions.length} questions{" "}
            <span className="text-faint">·</span> {LEVELS[quiz.difficulty].label}
          </p>
          <div className="flex gap-2">
            <button onClick={() => generate()} disabled={loading} className="rounded-full border border-line px-4 py-1.5 text-[13px] hover:border-ink disabled:opacity-50">
              {loading ? `Writing… ${elapsed}s` : "Regenerate"}
            </button>
            <button onClick={() => setEditing(true)} className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-paper">
              New quiz
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={generate} className="rounded-2xl border border-line bg-card print:hidden">
          <div className="flex items-center gap-1 border-b border-line px-3 pt-3">
            {(["upload", "paste"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-3 pb-2.5 text-[14px] transition-colors ${
                  tab === t ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t === "upload" ? "Upload a file" : "Paste text"}
              </button>
            ))}
            <button type="button" onClick={loadSample} className="ml-auto pb-2.5 text-[13px] text-muted underline decoration-line underline-offset-4 hover:text-ink">
              Try a sample
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {tab === "upload" ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pick(e.dataTransfer.files[0]);
                }}
                className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
                  dragging ? "border-pen bg-pen-soft/40" : "border-line hover:border-faint"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                  onChange={(e) => pick(e.target.files?.[0])}
                />
                {file ? (
                  <>
                    <p className="font-display text-3xl">{file.name}</p>
                    <p className="num mt-2 text-xs text-muted">
                      {ACCEPT[file.type || "text/markdown"]} · {size(file.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="mt-4 text-[13px] text-muted underline decoration-line underline-offset-4 hover:text-pen"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-display text-3xl">Drop a file here</p>
                    <p className="mt-2 text-[14px] text-muted">or click to browse. PDF, PNG, JPEG, WebP or text, up to 4 MB.</p>
                    <p className="mt-1 text-[13px] text-faint">Scanned pages and photos of handwritten notes work too.</p>
                  </>
                )}
              </label>
            ) : (
              <div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_CHARS))}
                  placeholder="Paste a chapter, an article or your notes…"
                  aria-label="Source text"
                  className="lined min-h-56 w-full resize-y rounded-xl border border-line bg-paper/50 px-4 py-[2px] text-[15px] outline-none placeholder:text-faint focus:border-faint"
                />
                <p className="num mt-1.5 text-right text-[11px] text-faint">
                  {text.length.toLocaleString()} / {MAX_TEXT_CHARS.toLocaleString()}
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="num mb-2.5 text-[11px] uppercase tracking-[0.16em] text-muted">Questions</p>
                <div className="flex flex-wrap items-center gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={count === c}
                      onClick={() => setCount(c)}
                      className={`num h-9 w-11 rounded-lg border text-[14px] transition-colors ${
                        count === c ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={MAX_QUESTIONS}
                    value={countDraft ?? count}
                    aria-label="Custom number of questions"
                    onChange={(e) => {
                      setCountDraft(e.target.value);
                      const v = Number(e.target.value);
                      if (Number.isInteger(v) && v >= 1 && v <= MAX_QUESTIONS) setCount(v);
                    }}
                    onBlur={() => setCountDraft(null)}
                    className="num h-9 w-16 rounded-lg border border-line bg-transparent px-2 text-center text-[14px] outline-none focus:border-ink"
                  />
                </div>
              </div>
              <div>
                <p className="num mb-2.5 text-[11px] uppercase tracking-[0.16em] text-muted">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(LEVELS) as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={difficulty === d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                        difficulty === d ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                      }`}
                    >
                      <span className="block text-[14px]">{LEVELS[d].label}</span>
                      <span className={`block text-[11px] ${difficulty === d ? "text-paper/60" : "text-faint"}`}>
                        {LEVELS[d].audience}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
            <p className="text-[13px] text-pen">{error}</p>
            <div className="flex items-center gap-3">
              {quiz && (
                <button type="button" onClick={() => setEditing(false)} className="text-[13px] text-muted hover:text-ink">
                  Back to quiz
                </button>
              )}
              <button
                type="submit"
                disabled={!ready || loading}
                className="rounded-full bg-ink px-6 py-2.5 text-[15px] text-paper transition-transform active:scale-[0.98] disabled:opacity-30"
              >
                {loading ? `Writing questions… ${elapsed}s` : "Generate quiz"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div ref={quizRef} className="scroll-mt-6">
        {loading && !quiz && <Skeleton n={Math.min(count, 3)} />}
        {quiz && <QuizView key={quiz.title + quiz.questions[0]?.question} quiz={quiz} dim={loading} />}
        {!editing && error && <p className="mt-4 text-sm text-pen print:hidden">{error}</p>}
      </div>
    </>
  );
}

function Skeleton({ n }: { n: number }) {
  return (
    <div className="mt-10 space-y-4">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-card p-6">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="skeleton h-11 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
