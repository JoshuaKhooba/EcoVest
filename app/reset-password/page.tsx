"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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

        {!token ? (
          <>
            <h1 className="text-xl font-bold text-navy-900">Invalid reset link</h1>
            <p className="mt-3 text-sm text-slate-600">
              This link is missing its reset token. Request a new one from the forgot password
              page.
            </p>
            <Link href="/forgot-password" className="btn-primary mt-6 block w-full text-center">
              Request a new link
            </Link>
          </>
        ) : success ? (
          <>
            <h1 className="text-xl font-bold text-navy-900">Password updated</h1>
            <p className="mt-3 text-sm text-slate-600">
              Redirecting you to log in with your new password…
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-navy-900">Set a new password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new password for your simulated account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  New password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
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
