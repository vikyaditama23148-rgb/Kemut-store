"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="px-5 max-w-md mx-auto py-32 text-center">
        <h1 className="font-display text-2xl font-semibold mb-4">Check your email</h1>
        <p className="text-on-surface-variant">
          We sent a confirmation link to {email}. Confirm to activate your account, then sign in.
        </p>
        <Link href="/login" className="btn-primary mt-8 inline-flex">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 max-w-md mx-auto py-32">
      <h1 className="font-display text-3xl font-semibold mb-10 tracking-tightest">CREATE ACCOUNT</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-line"
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-line"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-line"
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-on-surface-variant mt-8">
        Already have an account?{" "}
        <Link href="/login" className="underline hover:text-gold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
