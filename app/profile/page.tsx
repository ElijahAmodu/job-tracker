"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Profile } from "@/lib/types";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<Profile>();

    if (data) {
      setProfileId(data.id);
      setFullName(data.full_name);
      setEmail(data.email);
      setPhone(data.phone ?? "");
      setLocation(data.location ?? "");
      setGithub(data.links?.github ?? "");
      setPortfolio(data.links?.portfolio ?? "");
      setLinkedin(data.links?.linkedin ?? "");
      setSummary(data.summary ?? "");
    } else {
      // Pre-fill email from the auth account as a sensible default
      setEmail(user.email ?? "");
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: fullName,
      email,
      phone: phone || null,
      location: location || null,
      links: {
        github: github || undefined,
        portfolio: portfolio || undefined,
        linkedin: linkedin || undefined,
      },
      summary: summary || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = profileId
      ? await supabase.from("profile").update(payload).eq("id", profileId)
      : await supabase.from("profile").insert(payload);

    setSaving(false);

    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }

    setSaved(true);
    load();
  }

  if (loading) return <main className="p-6">Loading…</main>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your profile</h1>
      <p className="text-sm text-gray-600 mb-6">
        This is the contact info and summary that appears at the top of every
        tailored resume.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Location (e.g. Lagos, Nigeria)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Portfolio URL"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="GitHub URL"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="LinkedIn URL"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 h-28"
          placeholder="Default professional summary (fallback if a tailored one isn't generated)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {saved && <span className="text-sm text-green-600 ml-3">Saved</span>}
      </form>
    </main>
  );
}
