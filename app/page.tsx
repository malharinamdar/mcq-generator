import AnswerSheet from "@/components/AnswerSheet";
import Generator from "@/components/Generator";

export default function Home() {
  return (
    <>
      <section className="relative grid items-center gap-8 pt-8 pb-12 sm:pt-14 sm:pb-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 print:hidden">
        <div className="ruled pointer-events-none absolute inset-x-0 top-0 -z-10 h-64" />
        <div>
        <p className="num text-[11px] uppercase tracking-[0.16em] text-muted">PDF, photo or text in. Graded quiz out.</p>
        <h1 className="mt-5 max-w-3xl font-display text-[52px] leading-[0.98] tracking-[-0.01em] sm:text-[72px]">
          Turn any reading into a test <em className="text-pen">worth taking.</em>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
          Drop in lecture notes, a chapter or a photo of the whiteboard. You get questions grounded in that material,
          plausible wrong answers, and an explanation for every one.
        </p>
        </div>
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <AnswerSheet />
        </div>
      </section>
      <Generator />
    </>
  );
}
