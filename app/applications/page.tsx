"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { Application } from "../../lib/types";

export default function ApplicationsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    load();
  }

  async function load() {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApplications(data as Application[]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function createDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      company,
      role_title: roleTitle,
      job_url: jobUrl || null,
      job_description: jobDescription,
      status: "draft",
    });

    setSaving(false);

    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }

    setCompany("");
    setRoleTitle("");
    setJobUrl("");
    setJobDescription("");
    load();
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <button onClick={signOut} className="text-sm underline text-gray-500">
          Sign out
        </button>
      </div>

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
