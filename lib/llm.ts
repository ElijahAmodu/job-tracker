import { TailorInput, TailorOutput } from "./llm-shared";
import { tailorWithGemini } from "./gemini";
import { tailorWithOpenRouter } from "./openrouter";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 503 (overloaded) and 429 (rate limited) are worth retrying; other errors aren't. */
function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("503") || msg.includes("429") || msg.includes("UNAVAILABLE")
  );
}

/**
 * Tries Gemini first (fastest, largest free quota), retrying twice with
 * backoff on transient overload/rate-limit errors. If Gemini still fails
 * after that — or fails with something non-transient — falls back to
 * OpenRouter's free-model lineup, which runs on separate infrastructure
 * and quota, trying each candidate model until one responds.
 *
 * Only throws if both providers fail, with both error messages included
 * so the real cause is visible instead of just the last one.
 */
export async function tailorApplication(
  input: TailorInput,
): Promise<TailorOutput> {
  const backoffsMs = [1000, 3000];
  let lastGeminiError: unknown;

  for (let attempt = 0; attempt <= backoffsMs.length; attempt++) {
    try {
      return await tailorWithGemini(input);
    } catch (err) {
      lastGeminiError = err;
      if (!isTransient(err) || attempt === backoffsMs.length) break;
      await sleep(backoffsMs[attempt]);
    }
  }

  // Gemini exhausted its retries — fall back to DeepSeek if it's configured.
  if (!process.env.OPENROUTER_API_KEY) {
    throw lastGeminiError instanceof Error
      ? lastGeminiError
      : new Error(String(lastGeminiError));
  }

  try {
    return await tailorWithOpenRouter(input);
  } catch (openRouterErr) {
    const geminiMsg =
      lastGeminiError instanceof Error
        ? lastGeminiError.message
        : String(lastGeminiError);
    const openRouterMsg =
      openRouterErr instanceof Error
        ? openRouterErr.message
        : String(openRouterErr);
    throw new Error(
      `Both providers failed. Gemini: ${geminiMsg} | OpenRouter: ${openRouterMsg}`,
    );
  }
}
