"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { Application } from "../../lib/types";

export default function ApplicationsPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApplications(data as Application[]);
  }

  async function createDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // if (!user) return;

        if (!user) {
      setSaving(false);
      alert("You're not signed in — log in before saving an application.");
      return;
    }

    const { error } = await supabase.from('applications').insert({...});

    setSaving(false);

    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }

    await supabase.from("applications").insert({
      user_id: user.id,
      company,
      role_title: roleTitle,
      job_url: jobUrl || null,
      job_description: jobDescription,
      status: "draft",
    });

    setCompany("");
    setRoleTitle("");
    setJobUrl("");
    setJobDescription("");
    setSaving(false);
    load();
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      <form
        onSubmit={createDraft}
        className="space-y-3 mb-10 border rounded-lg p-4"
      >
        <h2 className="font-semibold">New application</h2>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Role title"
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Job posting URL (optional)"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 h-40"
          placeholder="Paste the full job description here"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
      </form>

      <div className="space-y-2">
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <span className="font-medium">
                {app.role_title} — {app.company}
              </span>
              <span className="text-sm text-gray-500 uppercase">
                {app.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
