"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalGroups } from "@/hooks/useLocalGroups";

export default function Home() {
  const router = useRouter();
  const { getLastGroup, addGroup } = useLocalGroups();
  const [checked, setChecked] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const last = getLastGroup();
    if (last) {
      router.replace(`/g/${last.id}`);
    } else {
      setChecked(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [getLastGroup, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const group = await res.json();
      addGroup(group.id, group.name);
      router.push(`/g/${group.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!checked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-gold/40 text-2xl font-display animate-pulse">🎲</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Background card suit watermarks */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[40rem] text-white/[0.02] font-display leading-none">♠</span>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="font-display text-5xl text-gold tracking-widest mb-2">
            LUNCH DICE
          </h1>
          <p className="text-cream/70 text-sm tracking-wider uppercase">
            Who pays today?
          </p>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-gold/20" />
          <span className="text-gold/40 text-xs">♦</span>
          <div className="flex-1 h-px bg-gold/20" />
        </div>

        {/* Create group form */}
        <form onSubmit={handleCreate} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-cream/75 text-xs uppercase tracking-widest">
              Group name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Office Crew"
              maxLength={50}
              className="bg-felt border border-gold/30 text-cream placeholder-cream/40
                         rounded px-4 py-3 text-base outline-none
                         focus:border-gold/70 focus:shadow-gold transition-all"
            />
          </div>

          {error && (
            <p className="text-danger-bright text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={!groupName.trim() || loading}
            className="bg-gold text-casino-black font-display tracking-widest text-sm py-3 px-6
                       rounded transition-all
                       hover:bg-gold-light
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create Group"}
          </button>
        </form>

        {/* Join existing */}
        <p className="text-cream/60 text-xs text-center">
          Have a link? Just open it — you'll be added automatically.
        </p>
      </div>
    </main>
  );
}
