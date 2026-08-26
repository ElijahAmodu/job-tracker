"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ExperienceItem, ExperienceType } from "@/lib/types";

const TYPE_OPTIONS: { value: ExperienceType; label: string }[] = [
  { value: "job", label: "Job" },
  { value: "project", label: "Project" },
  { value: "education", label: "Education" },
  { value: "certification", label: "Certification" },
];

export default function ExperiencePage() {
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state
  const [type, setType] = useState<ExperienceType>("job");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [bulletsText, setBulletsText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

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
      .from("experience_items")
      .select("*")
      .order("display_order", { ascending: true })
      .order("start_date", { ascending: false });
    if (data) setItems(data as ExperienceItem[]);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setType("job");
    setTitle("");
    setOrganization("");
    setStartDate("");
    setEndDate("");
    setCurrent(false);
    setBulletsText("");
    setTagsText("");
  }

  function startEdit(item: ExperienceItem) {
    setEditingId(item.id);
    setType(item.type);
    setTitle(item.title);
    setOrganization(item.organization ?? "");
    setStartDate(item.start_date ?? "");
    setEndDate(item.end_date ?? "");
    setCurrent(!item.end_date);
    setBulletsText(item.bullets.join("\n"));
    setTagsText(item.tags.join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const bullets = bulletsText
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (bullets.length === 0) {
      setSaving(false);
      alert(
        "Add at least one bullet — this is the raw material the tailoring pulls from.",
      );
      return;
    }

    const payload = {
      user_id: user.id,
      type,
      title,
      organization: organization || null,
      start_date: startDate || null,
      end_date: current ? null : endDate || null,
      bullets,
      tags,
    };

    const { error } = editingId
      ? await supabase
          .from("experience_items")
          .update(payload)
          .eq("id", editingId)
      : await supabase.from("experience_items").insert(payload);

    setSaving(false);

    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }

    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this experience item?")) return;
    await supabase.from("experience_items").delete().eq("id", id);
    load();
  }

  if (loading) return <main className="p-6">Loading…</main>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Experience</h1>
      <p className="text-sm text-gray-600 mb-6">
        This is the source material the tailoring pulls from — jobs, projects,
        education, certifications. Write real, honest bullets and tag each item
        with the skills/keywords it demonstrates; tags are what the matcher uses
        to pick relevant items for a given job description, and what Gemini uses
        to phrase things toward that JD without inventing anything.
      </p>

      <form
        onSubmit={handleSave}
        className="space-y-3 mb-10 border rounded-lg p-4"
      >
        <h2 className="font-semibold">
          {editingId ? "Edit item" : "Add item"}
        </h2>

        <select
          className="w-full border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value as ExperienceType)}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Title (e.g. Frontend Engineer, or project name)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Organization (optional for personal projects)"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />

        <div className="flex gap-3">
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={current}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={current}
            onChange={(e) => setCurrent(e.target.checked)}
          />
          This is current / ongoing
        </label>

        <textarea
          className="w-full border rounded px-3 py-2 h-32"
          placeholder={
            "One bullet per line, e.g.:\nBuilt a React Native fitness app used by 200+ users\nReduced API response time by 40% via query optimization"
          }
          value={bulletsText}
          onChange={(e) => setBulletsText(e.target.value)}
          required
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Tags, comma-separated (e.g. react, typescript, supabase, postgres)"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Saving…" : editingId ? "Update item" : "Add item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border rounded px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">
            No experience items yet — add at least one above before you can
            generate a tailored resume.
          </p>
        )}
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {item.title}
                  {item.organization ? ` — ${item.organization}` : ""}
                </p>
                <p className="text-xs text-gray-500 uppercase">{item.type}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(item)} className="underline">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="underline text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
              {item.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 rounded px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
