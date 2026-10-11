// Minimal OpenAI client (no SDK) for strict structured output.

const URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

export type Part =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { filename: string; file_data: string } };

export class MissingKeyError extends Error {}
export class ModelError extends Error {}

export async function generateJSON<T>({
  system,
  parts,
  schema,
  temperature = 0.4,
}: {
  system: string;
  parts: Part[];
  schema: object;
  temperature?: number;
}): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new MissingKeyError("OPENAI_API_KEY is not configured.");

  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature,
      max_tokens: 12000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: parts },
      ],
      response_format: { type: "json_schema", json_schema: { name: "quiz", strict: true, schema } },
    }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new ModelError(`OpenAI returned ${res.status}. ${detail}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0];
  if (choice?.message?.refusal) throw new ModelError("The model declined this material.");
  if (!choice?.message?.content) throw new ModelError(`Empty response (${choice?.finish_reason ?? "unknown"}).`);
  try {
    return JSON.parse(choice.message.content) as T;
  } catch {
    throw new ModelError("The model returned malformed JSON.");
  }
}
