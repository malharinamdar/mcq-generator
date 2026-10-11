import { generateJSON, MissingKeyError, type Part } from "@/lib/llm";
import { clean, SCHEMA, SYSTEM, userPrompt } from "@/lib/quiz";
import { limited } from "@/lib/ratelimit";
import { ACCEPT, MAX_FILE_BYTES, MAX_QUESTIONS, MAX_TEXT_CHARS, type Difficulty } from "@/lib/types";

export const maxDuration = 60;

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (limited(req)) return fail("Too many quizzes in a short time. Give it a few minutes.", 429);

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected a form upload.", 400);

  const count = Number(form.get("count"));
  const difficulty = String(form.get("difficulty")) as Difficulty;
  if (!Number.isInteger(count) || count < 1 || count > MAX_QUESTIONS)
    return fail(`Choose between 1 and ${MAX_QUESTIONS} questions.`, 422);
  if (!["easy", "medium", "hard"].includes(difficulty)) return fail("Unknown difficulty.", 422);

  const file = form.get("file");
  const text = form.get("text");
  const parts: Part[] = [];

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return fail("Files must be under 4 MB.", 413);
    const type = file.type || (file.name.endsWith(".md") ? "text/markdown" : "");
    if (!ACCEPT[type]) return fail("Upload a PDF, an image (PNG, JPEG, WebP) or a text file.", 415);
    if (type.startsWith("text/")) {
      const body = (await file.text()).trim();
      if (body.length < 200) return fail("That file has too little text to write questions from.", 422);
      parts.push({ type: "text", text: `Material:\n"""\n${body.slice(0, MAX_TEXT_CHARS)}\n"""` });
    } else {
      const data = Buffer.from(await file.arrayBuffer()).toString("base64");
      parts.push(
        type === "application/pdf"
          ? { type: "file", file: { filename: file.name || "material.pdf", file_data: `data:${type};base64,${data}` } }
          : { type: "image_url", image_url: { url: `data:${type};base64,${data}` } },
        { type: "text", text: "The material is the attached document." },
      );
    }
  } else if (typeof text === "string" && text.trim()) {
    const body = text.trim();
    if (body.length < 200) return fail("Paste at least a paragraph or two (200+ characters).", 422);
    parts.push({ type: "text", text: `Material:\n"""\n${body.slice(0, MAX_TEXT_CHARS)}\n"""` });
  } else {
    return fail("Add a file or paste some text.", 422);
  }
  parts.push({ type: "text", text: userPrompt(count, difficulty) });

  try {
    const raw = await generateJSON<{ title?: string; questions?: unknown[] }>({ system: SYSTEM, parts, schema: SCHEMA });
    const questions = clean(raw, count);
    if (!questions.length)
      return fail("Couldn't write usable questions from that material. Try a longer or clearer source.", 422);
    return Response.json({ title: String(raw.title ?? "Your quiz").slice(0, 80), difficulty, questions });
  } catch (err) {
    if (err instanceof MissingKeyError) return fail("The generator is not configured on this deployment.", 503);
    console.error(err);
    return fail("The model is unavailable right now. Try again in a moment.", 502);
  }
}
