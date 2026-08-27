import {
  TailorInput,
  TailorOutput,
  buildPrompt,
  parseModelJson,
} from "./llm-shared";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter's free lineup rotates — models get pulled or moved to paid with
// no warning (this is what broke deepseek/deepseek-r1:free). Rather than trust
// one slug, we try a short list in order and use whichever responds. Check
// https://openrouter.ai/models?max_price=0 if all of these ever 404.
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-4-maverick:free",
  "openrouter/free", // OpenRouter's own auto-router — picks any available free model
];

/**
 * Fallback provider for when Gemini is rate-limited or overloaded (503).
 * Uses OpenRouter's free tier — no card required, separate quota from Gemini's.
 * Tries each model in FREE_MODELS in order; only throws once all have failed.
 */
export async function tailorWithOpenRouter(
  input: TailorInput,
): Promise<TailorOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const prompt = buildPrompt(input);
  const errors: string[] = [];

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        errors.push(`${model}: ${res.status} ${errText}`);
        continue; // try the next model in the list
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        errors.push(`${model}: returned no content`);
        continue;
      }

      return parseModelJson(text);
    } catch (err) {
      errors.push(
        `${model}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  throw new Error(`All OpenRouter free models failed — ${errors.join(" | ")}`);
}
