"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(searchParams.get("next") || "/account");
    router.refresh();
  }

  return (
    <div className="px-5 max-w-md mx-auto py-32">
      <h1 className="font-display text-3xl font-semibold mb-10 tracking-tightest">SIGN IN</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-line"
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-4">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-sm text-on-surface-variant mt-8">
        Don't have an account?{" "}
        <Link href="/register" className="underline hover:text-gold">
          Register
        </Link>
      </p>
    </div>
  );
}
