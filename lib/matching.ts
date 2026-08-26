import { ExperienceItem } from './types';

/**
 * Cheap, deterministic pre-filter: scores each experience item by how many
 * of its tags appear (as whole words) in the job description. Runs before
 * the LLM call so we only send relevant experience, keeping prompts small
 * and cutting down on wasted free-tier requests.
 *
 * This is intentionally simple — no ML, no embeddings. Good enough to trim
 * 15 experience items down to the 4-6 that actually matter for a given JD.
 */
export function matchExperience(
  items: ExperienceItem[],
  jobDescription: string,
  topN = 6
): ExperienceItem[] {
  const jdLower = jobDescription.toLowerCase();

  const scored = items.map((item) => {
    let score = 0;
    for (const tag of item.tags) {
      const pattern = new RegExp(`\\b${escapeRegExp(tag.toLowerCase())}\\b`);
      if (pattern.test(jdLower)) score += 1;
    }
    // Small recency boost: current/undated items (end_date null) rank slightly higher
    if (!item.end_date) score += 0.25;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Always include at least topN items even if score is 0, so a thin tag
  // vocabulary doesn't leave the resume empty.
  return scored.slice(0, topN).map((s) => s.item);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
