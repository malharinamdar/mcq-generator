import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "MCQ Generator — quizzes from your notes",
  description: "Upload a PDF, a photo of notes or plain text and get a graded multiple-choice quiz with explanations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8 print:hidden">
          <a href="/" className="flex items-center gap-2.5" aria-label="MCQ Generator home">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="5.5" fill="var(--color-pen)" />
            </svg>
            <span className="text-[17px] font-medium tracking-tight">MCQ Generator</span>
          </a>
          <a
            href="https://github.com/malharinamdar/mcq-generator"
            className="num text-xs text-muted transition-colors hover:text-ink"
          >
            source
          </a>
        </header>
        <main className="mx-auto w-full max-w-5xl px-5 sm:px-8">{children}</main>
        <footer className="mx-auto mt-24 w-full max-w-5xl px-5 pb-10 sm:px-8 print:hidden">
          <div className="flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:justify-between">
            <p>
              Built by{" "}
              <a className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink" href="https://github.com/malharinamdar">
                Malhar Inamdar
              </a>
              <span className="mx-2 text-faint">·</span>
              <span className="text-faint">Questions written by GPT-4.1 mini from your material.</span>
            </p>
            <a className="num text-xs hover:text-ink" href="https://github.com/malharinamdar/mcq-generator/tree/legacy-streamlit">
              v1 (streamlit)
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
