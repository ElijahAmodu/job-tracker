import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { matchExperience } from "@/lib/matching";
import { tailorApplication } from "@/lib/llm";
import { ExperienceItem, Profile } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { applicationId, jobDescription, company, roleTitle } =
    await req.json();

  if (!applicationId || !jobDescription || !company || !roleTitle) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Profile>();

  const { data: experienceItems } = await supabase
    .from("experience_items")
    .select("*")
    .eq("user_id", user.id)
    .returns<ExperienceItem[]>();

  if (!profile) {
    return NextResponse.json(
      { error: "No profile found — fill in your profile at /profile first" },
      { status: 400 },
    );
  }
  if (!experienceItems || experienceItems.length === 0) {
    return NextResponse.json(
      {
        error:
          "No experience items found — add at least one at /experience first",
      },
      { status: 400 },
    );
  }

  // Step 1: cheap deterministic filter — grouped by type so jobs, projects,
  // and education don't crowd each other out (see lib/matching.ts)
  const matched = matchExperience(experienceItems, jobDescription);
  const matchedIds = [
    ...matched.jobs,
    ...matched.projects,
    ...matched.education,
    ...matched.certifications,
  ].map((m) => m.id);

  // Step 2: LLM tailoring pass
  let result;
  try {
    result = await tailorApplication({
      profile,
      matched,
      jobDescription,
      company,
      roleTitle,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Tailoring failed: ${err.message}` },
      { status: 502 },
    );
  }

  // Step 3: persist the draft — status stays 'draft' until the user actually
  // applies and flips it themselves. Nothing here submits anything anywhere.
  const { error: updateError } = await supabase
    .from("applications")
    .update({
      tailored_resume: result.resume,
      tailored_cover_letter: result.cover_letter,
      matched_experience_ids: matchedIds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    resume: result.resume,
    cover_letter: result.cover_letter,
    matched_experience_ids: matchedIds,
  });
}
