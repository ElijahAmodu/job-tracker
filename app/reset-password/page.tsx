"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Reached via the link in a Supabase password-recovery email.
// @supabase/ssr's browser client defaults to the PKCE flow, so the link
// arrives as `?code=...` in the query string — it does NOT automatically
// become a session on page load. We have to explicitly exchange that code
// for a session before updateUser() can work.
export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    async function init() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        // PKCE flow — this is the path an @supabase/ssr project actually uses.
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setLinkError(error.message);
          setLinkFailed(true);
          return;
        }
        setReady(true);
        return;
      }

      // Fallback for the older hash-fragment flow, in case your Supabase
      // project has PKCE disabled — the client parses '#access_token=...'
      // automatically, so by the time we get here a session may already exist.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
        return;
      }

      // No code param and no session yet — wait briefly for the hash-based
      // flow to finish parsing, then give up with a clear message instead
      // of hanging on "Verifying…" forever.
      const { data: listener } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") setReady(true);
      });
      unsub = () => listener.subscription.unsubscribe();

      setTimeout(() => {
        setReady((current) => {
          if (!current) setLinkFailed(true);
          return current;
        });
      }, 4000);
    }

    init();
    return () => unsub?.();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (linkFailed) {
    return (
      <main className="max-w-sm mx-auto p-6 mt-20">
        <p className="text-sm text-red-600 mb-2">
          This reset link is invalid or has expired
          {linkError ? `: ${linkError}` : "."}
        </p>
        <a href="/login" className="text-sm underline">
          Request a new reset link
        </a>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="max-w-sm mx-auto p-6 mt-20">
        <p className="text-sm text-gray-600">Verifying your reset link…</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="max-w-sm mx-auto p-6 mt-20">
        <p className="text-sm text-green-600">
          Password updated — redirecting to sign in…
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-sm mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
// JobtrackerTestPassword
