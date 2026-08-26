"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase";
import { Application, Profile } from "@/lib//types";
import { ResumeDocument } from "@/components/pdf/ResumeDocument";
import { CoverLetterDocument } from "@/components/pdf/CoverLetterDocument";

// react-pdf needs to run client-side only
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false },
);

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [application, setApplication] = useState<Application | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data: app } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(prof as Profile);
    }
    setApplication(app as Application);
  }

  async function runTailoring() {
    if (!application) return;
    setTailoring(true);
    setError("");
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          jobDescription: application.job_description,
          company: application.company,
          roleTitle: application.role_title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTailoring(false);
    }
  }

  async function updateField(field: "tailored_cover_letter", value: string) {
    if (!application) return;
    await supabase
      .from("applications")
      .update({ [field]: value })
      .eq("id", application.id);
  }

  async function markApplied() {
    if (!application) return;
    await supabase
      .from("applications")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .eq("id", application.id);
    load();
  }

  if (!application) return <main className="p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {application.role_title} — {application.company}
        </h1>
        <span className="text-sm uppercase text-gray-500">
          {application.status}
        </span>
      </div>

      {!application.tailored_resume && (
        <button
          onClick={runTailoring}
          disabled={tailoring}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {tailoring
            ? "Tailoring… (calling Gemini)"
            : "Generate tailored resume + cover letter"}
        </button>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {application.tailored_resume && (
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Tailored resume</h2>
          <p className="text-sm text-gray-700 mb-2">
            {application.tailored_resume.summary}
          </p>
          {application.tailored_resume.sections.map((s, i) => (
            <div key={i} className="mb-3">
              <h3 className="text-sm font-semibold">{s.heading}</h3>
              {s.items.map((it, j) => (
                <div key={j} className="ml-2 mb-2">
                  <p className="text-sm font-medium">
                    {it.title} {it.organization ? `— ${it.organization}` : ""}
                  </p>
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {it.bullets.map((b, k) => (
                      <li key={k}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}

          {profile && (
            <PDFDownloadLink
              document={
                <ResumeDocument
                  profile={profile}
                  resume={application.tailored_resume}
                />
              }
              fileName={`resume-${application.company}.pdf`}
              className="inline-block mt-2 text-sm underline"
            >
              Download resume PDF
            </PDFDownloadLink>
          )}
        </section>
      )}

      {application.tailored_cover_letter !== null && (
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">
            Cover letter (edit freely before exporting)
          </h2>
          <textarea
            className="w-full border rounded px-3 py-2 h-56 text-sm"
            defaultValue={application.tailored_cover_letter}
            onBlur={(e) => updateField("tailored_cover_letter", e.target.value)}
          />
          {profile && application.tailored_cover_letter && (
            <PDFDownloadLink
              document={
                <CoverLetterDocument
                  profile={profile}
                  company={application.company}
                  roleTitle={application.role_title}
                  body={application.tailored_cover_letter}
                />
              }
              fileName={`cover-letter-${application.company}.pdf`}
              className="inline-block mt-2 text-sm underline"
            >
              Download cover letter PDF
            </PDFDownloadLink>
          )}
        </section>
      )}

      {application.status === "draft" && application.tailored_resume && (
        <button
          onClick={markApplied}
          className="border rounded px-4 py-2 text-sm"
        >
          Mark as applied (after you've submitted it yourself on the company
          site)
        </button>
      )}
    </main>
  );
}
