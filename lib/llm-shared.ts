import { ExperienceItem, Profile, ResumeDraft } from "./types";
import { MatchGroups } from "./matching";

export interface TailorInput {
  profile: Profile;
  matched: MatchGroups;
  jobDescription: string;
  company: string;
  roleTitle: string;
}

export interface TailorOutput {
  resume: ResumeDraft;
  cover_letter: string;
}

function describeItem(item: ExperienceItem, i: number): string {
  return `
[${i + 1}] ${item.title}${item.organization ? ` — ${item.organization}` : ""}
Dates: ${item.start_date ?? "?"} to ${item.end_date ?? "present"}
Bullets:
${item.bullets.map((b) => `  - ${b}`).join("\n")}
Tags: ${item.tags.join(", ")}
`;
}

/**
 * Same prompt regardless of which model answers it, so switching providers
 * (or falling back) never changes the instructions or the JSON contract.
 *
 * The output shape is FIXED (experience / projects / skills / education) —
 * not a free-form list of sections — so the resume always has all four,
 * matching the source resume's format instead of whatever the model feels
 * like producing.
 */
export function buildPrompt(input: TailorInput): string {
  const { profile, matched, jobDescription, company, roleTitle } = input;
  const { jobs, projects, education, certifications, allTags } = matched;

  return `You are helping a real job applicant tailor their resume and write a cover letter for a specific role. You must not invent experience, employers, dates, metrics, or skills that are not present in the source material below. Only rephrase and reprioritize what is given, mirroring the vocabulary of the job description where it is truthfully applicable.

CANDIDATE PROFILE:
Name: ${profile.full_name}
Default summary: ${profile.summary ?? "(none provided)"}

SOURCE WORK EXPERIENCE (rewrite bullets for these — do not add or remove entries):
${jobs.map(describeItem).join("\n")}

SOURCE PROJECTS (rewrite for these — do not add or remove entries):
${projects.length > 0 ? projects.map(describeItem).join("\n") : "(none provided)"}

SOURCE EDUCATION (include exactly as given — do not reword facts, dates, or institution names):
${education.length > 0 ? education.map(describeItem).join("\n") : "(none provided)"}

SOURCE CERTIFICATIONS:
${certifications.length > 0 ? certifications.map(describeItem).join("\n") : "(none provided)"}

FULL SKILLS INVENTORY (the ONLY skills you may use in the "skills" output — do not add any not listed here):
${allTags.join(", ")}

TARGET ROLE:
Company: ${company}
Title: ${roleTitle}
Job description:
"""
${jobDescription}
"""

TASK:
1. Write a concise professional summary (2-3 sentences), grounded only in the source experience, tailored toward this role.
2. For each source work experience item, rewrite its bullets so the language mirrors terms and priorities from the job description where truthfully applicable. ALWAYS produce at least 3 bullets per job — if the source has fewer than 3, split or elaborate on the true facts given without inventing new claims, never pad with generic filler. Also list a short tech_stack array for each job (drawn only from that item's tags).
3. For each source project, write a 1-2 sentence description (not bullets) summarizing what it does and its relevance, plus a tech_stack array (drawn only from that item's tags).
4. Reproduce the education entries as given, unchanged.
5. Build a "skills" array: select and order entries from the FULL SKILLS INVENTORY above, prioritizing ones relevant to this job description, but do not invent any skill not in that inventory.
6. Draft a cover letter (3-4 short paragraphs) for ${roleTitle} at ${company}, referencing specific, true details from the source experience — not generic filler.

Respond with ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:
{
  "resume": {
    "role_title": "string (a professional headline for this candidate, e.g. 'Frontend Engineer')",
    "summary": "string",
    "experience": [
      { "title": "string", "organization": "string|null", "dates": "string|null", "bullets": ["string", "string", "string"], "tech_stack": ["string"] }
    ],
    "projects": [
      { "title": "string", "description": "string", "tech_stack": ["string"] }
    ],
    "skills": ["string"],
    "education": [
      { "title": "string", "organization": "string|null", "dates": "string|null" }
    ]
  },
  "cover_letter": "string"
}`;
}

/** Strips markdown code fences if a model adds them despite instructions not to. */
export function parseModelJson(text: string): TailorOutput {
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned) as TailorOutput;
}
