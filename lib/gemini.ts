import { ExperienceItem, Profile, ResumeDraft } from "./types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

interface TailorInput {
  profile: Profile;
  matchedExperience: ExperienceItem[];
  jobDescription: string;
  company: string;
  roleTitle: string;
}

interface TailorOutput {
  resume: ResumeDraft;
  cover_letter: string;
}

/**
 * Calls Gemini 2.5 Flash to rewrite existing resume bullets in the job
 * description's language, and draft a matching cover letter.
 *
 * Important constraint baked into the prompt: the model is told to REPHRASE
 * existing bullets, never invent new experience, dates, or skills. This is
 * enforced by instruction only — always have the human review step catch
 * anything that drifts.
 */
export async function tailorApplication(
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

  const parsed = JSON.parse(text) as TailorOutput;
  return parsed;
}

function buildPrompt(input: TailorInput): string {
  const { profile, matchedExperience, jobDescription, company, roleTitle } =
    input;

  return `You are helping a real job applicant tailor their resume and write a cover letter for a specific role. You must not invent experience, employers, dates, metrics, or skills that are not present in the source material below. Only rephrase and reprioritize what is given, mirroring the vocabulary of the job description where it is truthfully applicable.

CANDIDATE PROFILE:
Name: ${profile.full_name}
Summary: ${profile.summary ?? "(none provided)"}

SOURCE EXPERIENCE (the only facts you may draw from):
${matchedExperience
  .map(
    (item, i) => `
[${i + 1}] ${item.title}${item.organization ? ` — ${item.organization}` : ""} (${item.type})
Dates: ${item.start_date ?? "?"} to ${item.end_date ?? "present"}
Bullets:
${item.bullets.map((b) => `  - ${b}`).join("\n")}
Tags: ${item.tags.join(", ")}
`,
  )
  .join("\n")}

TARGET ROLE:
Company: ${company}
Title: ${roleTitle}
Job description:
"""
${jobDescription}
"""

TASK:
1. For each source experience item above, rewrite its bullets (same facts, same scope, no new claims) so the language mirrors terms and priorities from the job description, where truthfully applicable. Keep the same number of bullets or fewer — do not pad.
2. Write a concise professional summary (2-3 sentences) tailored to this role, grounded only in the source experience.
3. Draft a cover letter (3-4 short paragraphs) for ${roleTitle} at ${company}, referencing specific, true details from the source experience — not generic filler.

Respond with ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:
{
  "resume": {
    "summary": "string",
    "sections": [
      {
        "heading": "string",
        "items": [
          { "title": "string", "organization": "string|null", "dates": "string|null", "bullets": ["string"] }
        ]
      }
    ]
  },
  "cover_letter": "string"
}`;
}
