import { ExperienceItem } from "./types";

export interface MatchGroups {
  jobs: ExperienceItem[];
  projects: ExperienceItem[];
  education: ExperienceItem[];
  certifications: ExperienceItem[];
  allTags: string[]; // deduped tags across the user's ENTIRE experience, for the skills section
}

/**
 * Groups the user's experience by type, then scores each group by tag
 * overlap with the job description. A flat top-N pool (the old approach)
 * let jobs crowd out projects and education entirely, which is why the
 * generated resume was missing those sections. Instead:
 * - Jobs: top N by relevance (most resumes don't show every job for every role)
 * - Projects: top M by relevance
 * - Education & certifications: ALWAYS included in full — a resume without
 *   your degree isn't a resume, regardless of keyword overlap
 */
export function matchExperience(
  items: ExperienceItem[],
  jobDescription: string,
  opts: { maxJobs?: number; maxProjects?: number } = {},
): MatchGroups {
  const { maxJobs = 5, maxProjects = 3 } = opts;
  const jdLower = jobDescription.toLowerCase();

  function scoreAndSort(pool: ExperienceItem[]): ExperienceItem[] {
    return pool
      .map((item) => {
        let score = 0;
        for (const tag of item.tags) {
          const pattern = new RegExp(
            `\\b${escapeRegExp(tag.toLowerCase())}\\b`,
          );
          if (pattern.test(jdLower)) score += 1;
        }
        if (!item.end_date) score += 0.25; // slight recency boost for current roles
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);
  }

  const jobs = scoreAndSort(items.filter((i) => i.type === "job")).slice(
    0,
    maxJobs,
  );
  const projects = scoreAndSort(
    items.filter((i) => i.type === "project"),
  ).slice(0, maxProjects);
  const education = items.filter((i) => i.type === "education");
  const certifications = items.filter((i) => i.type === "certification");

  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)));

  return { jobs, projects, education, certifications, allTags };
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
