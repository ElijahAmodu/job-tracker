import {
  TailorInput,
  TailorOutput,
  buildPrompt,
  parseModelJson,
} from "./llm-shared";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * Calls Gemini to rewrite existing resume bullets in the job description's
 * language, and draft a matching cover letter.
 *
 * Important constraint baked into the prompt: the model is told to REPHRASE
 * existing bullets, never invent new experience, dates, or skills. This is
 * enforced by instruction only — always have the human review step catch
 * anything that drifts.
 *
 * Throws on any non-2xx response, including transient 503 "model overloaded"
 * errors from the free tier — retry/fallback logic lives in lib/llm.ts, not here.
 */
export async function tailorWithGemini(
  input: TailorInput,
): Promise<TailorOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const prompt = buildPrompt(input);

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");

  return parseModelJson(text);
}
