export type ExperienceType = 'job' | 'project' | 'education' | 'certification';

export interface ExperienceItem {
  id: string;
  type: ExperienceType;
  title: string;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  bullets: string[];
  tags: string[];
  display_order: number;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  links: { github?: string; portfolio?: string; linkedin?: string };
  summary: string | null;
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interview'
  | 'rejected'
  | 'offer'
  | 'withdrawn';

// Structured tailored resume returned by the LLM — kept as JSON, not raw text,
// so the PDF renderer and the editor UI can both work off the same shape.
export interface ResumeDraft {
  summary: string;
  sections: {
    heading: string; // e.g. "Experience", "Projects", "Education"
    items: {
      title: string;
      organization: string | null;
      dates: string | null;
      bullets: string[]; // tailored, LLM-rewritten bullets
    }[];
  }[];
}

export interface Application {
  id: string;
  company: string;
  role_title: string;
  job_url: string | null;
  job_description: string;
  status: ApplicationStatus;
  matched_experience_ids: string[];
  tailored_resume: ResumeDraft | null;
  tailored_cover_letter: string | null;
  notes: string | null;
  applied_at: string | null;
  created_at: string;
}

// What the /api/tailor route returns
export interface TailorResult {
  resume: ResumeDraft;
  cover_letter: string;
  matched_experience_ids: string[];
}
