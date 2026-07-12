"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-forest-700 px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/EcoVestIcon.png"
            alt="GROW icon"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-lg object-cover"
          />
          <div className="text-lg font-semibold text-navy-900">EcoVest</div>
        </div>

        {submitted ? (
          <>
            <h1 className="text-xl font-bold text-navy-900">Check your email</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              If an account exists for <span className="font-medium text-navy-900">{email}</span>,
              we&apos;ve sent a link to reset your password. It expires in 1 hour.
            </p>
            <Link href="/login" className="btn-primary mt-6 block w-full text-center">
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-navy-900">Forgot your password?</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your account email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Remembered it?{" "}
              <Link href="/login" className="font-medium text-forest-600 hover:underline">
                Back to log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
