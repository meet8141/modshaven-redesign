"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          password: formData.get("password"),
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ maxWidth: 800, margin: "100px auto", padding: 24, position: "relative", zIndex: 1 }}
      className="flex flex-col justify-center items-center gap-4"
    >
      <h2 className="font-[800] text-[2rem]">Login</h2>
      <form
        onSubmit={handleSubmit}
        className="w-[50%] flex gap-4 flex-col items-center p-8 rounded-[1rem] bg-black/30 backdrop-blur-lg border-2 border-[#ff6600]"
      >
        <div style={{ marginBottom: 16 }} className="flex flex-col justify-center items-center w-full">
          <label htmlFor="fullName">Username</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            className="bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
          />
        </div>
        <div style={{ marginBottom: 16 }} className="flex flex-col justify-center items-center w-full">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            className="bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]"
          />
        </div>

        {error ? <p className="text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "40%", padding: 10, background: "#ff6600", color: "#fff", border: "none" }}
          className="rounded-[1rem] flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login"}
          {!loading ? <MoveRight size={16} /> : null}
        </button>

       
      </form>
    </div>
  );
}
