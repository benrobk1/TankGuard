"use client";

import { useState, FormEvent } from "react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-green-300 font-medium mt-4">
        You&apos;re on the list! We&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-400 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Submitting..." : "Get Early Access"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm mt-1 sm:mt-0 sm:self-center">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
