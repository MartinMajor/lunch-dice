"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocalGroups } from "@/hooks/useLocalGroups";

interface Props {
  currentGroupId: string;
  currentGroupName: string;
}

type Mode = "idle" | "creating" | "joining";

export default function GroupSwitcher({ currentGroupId, currentGroupName }: Props) {
  const router = useRouter();
  const { groups, addGroup, removeGroup } = useLocalGroups();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [newName, setNewName] = useState("");
  const [newNameError, setNewNameError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmingForget, setConfirmingForget] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const newNameRef = useRef<HTMLInputElement>(null);
  const joinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeAll();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mode === "creating") setTimeout(() => newNameRef.current?.focus(), 50);
    if (mode === "joining") setTimeout(() => joinInputRef.current?.focus(), 50);
  }, [mode]);

  function closeAll() {
    setOpen(false);
    setMode("idle");
    setNewName("");
    setNewNameError("");
    setJoinInput("");
    setJoinError("");
    setConfirmingForget(null);
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/g/${currentGroupId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setNewNameError("");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      setNewNameError("Something went wrong. Try again.");
      setCreating(false);
      return;
    }

    const group = await res.json();
    addGroup(group.id, group.name);
    closeAll();
    router.push(`/g/${group.id}`);
  }

  function parseGroupId(input: string): string | null {
    const trimmed = input.trim();
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/");
      const gIndex = parts.indexOf("g");
      if (gIndex !== -1 && parts[gIndex + 1]) return parts[gIndex + 1];
    } catch {
      // not a URL — try as plain ID
    }
    if (/^[a-zA-Z0-9_-]{8,24}$/.test(trimmed)) return trimmed;
    return null;
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const id = parseGroupId(joinInput);
    if (!id) {
      setJoinError("Paste a valid Lunch Dice link or group ID.");
      return;
    }
    closeAll();
    router.push(`/g/${id}`);
  }

  function handleForgetConfirmed(id: string) {
    removeGroup(id);
    if (id === currentGroupId) {
      closeAll();
      router.push("/");
    } else {
      setConfirmingForget(null);
    }
  }

  const others = groups.filter((g) => g.id !== currentGroupId);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          setMode("idle");
          setConfirmingForget(null);
        }}
        className="flex items-center gap-2 text-gold font-display text-sm tracking-wider
                   hover:text-gold-light transition-colors"
      >
        <span>{currentGroupName}</span>
        <span className="text-xs text-gold/50">{open ? "▲" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#111118] border border-gold/20
                        rounded shadow-lg z-50 overflow-hidden">
          {/* Current group */}
          {confirmingForget === currentGroupId ? (
            <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gold/10">
              <span className="text-cream/70 text-xs flex-1">Forget this group?</span>
              <button
                onClick={() => handleForgetConfirmed(currentGroupId)}
                className="text-danger-bright text-xs hover:text-danger-bright/80 transition-colors"
              >
                Forget
              </button>
              <span className="text-cream/30 text-xs">·</span>
              <button
                onClick={() => setConfirmingForget(null)}
                className="text-cream/60 text-xs hover:text-cream transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gold/10">
              <span className="text-gold text-xs">✓</span>
              <span className="text-cream text-sm truncate flex-1">{currentGroupName}</span>
              <button
                onClick={() => setConfirmingForget(currentGroupId)}
                className="text-cream/30 hover:text-cream/70 transition-colors text-base leading-none flex-shrink-0"
                aria-label="Forget this group"
              >
                ×
              </button>
            </div>
          )}

          {/* Other saved groups */}
          {others.length > 0 && (
            <div className="border-b border-gold/10">
              {others.map((g) => (
                confirmingForget === g.id ? (
                  <div key={g.id} className="px-4 py-2.5 flex items-center gap-2">
                    <span className="text-cream/70 text-xs flex-1">Forget "{g.name}"?</span>
                    <button
                      onClick={() => handleForgetConfirmed(g.id)}
                      className="text-danger-bright text-xs hover:text-danger-bright/80 transition-colors"
                    >
                      Forget
                    </button>
                    <span className="text-cream/30 text-xs">·</span>
                    <button
                      onClick={() => setConfirmingForget(null)}
                      className="text-cream/60 text-xs hover:text-cream transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div key={g.id} className="flex items-center hover:bg-white/5 transition-colors">
                    <button
                      onClick={() => { closeAll(); router.push(`/g/${g.id}`); }}
                      className="flex-1 text-left px-4 py-2.5 text-cream/70 text-sm
                                 hover:text-cream transition-colors truncate"
                    >
                      {g.name}
                    </button>
                    <button
                      onClick={() => setConfirmingForget(g.id)}
                      className="pr-4 text-cream/30 hover:text-cream/70 transition-colors text-base leading-none flex-shrink-0"
                      aria-label={`Forget ${g.name}`}
                    >
                      ×
                    </button>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Actions */}
          {mode === "idle" && (
            <div className="border-b border-gold/10">
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2.5 text-cream/70 text-sm
                           hover:bg-white/5 hover:text-cream transition-colors"
              >
                {copied ? "✓ Copied!" : "⬡ Copy link"}
              </button>
              <button
                onClick={() => setMode("creating")}
                className="w-full text-left px-4 py-2.5 text-cream/70 text-sm
                           hover:bg-white/5 hover:text-cream transition-colors"
              >
                + Create new group
              </button>
              <button
                onClick={() => setMode("joining")}
                className="w-full text-left px-4 py-2.5 text-cream/70 text-sm
                           hover:bg-white/5 hover:text-cream transition-colors"
              >
                ↵ Join with a link
              </button>
            </div>
          )}

          {mode === "creating" && (
            <form onSubmit={handleCreate} className="p-3 flex flex-col gap-2 border-b border-gold/10">
              <input
                ref={newNameRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewNameError(""); }}
                placeholder="Group name"
                maxLength={50}
                className="bg-felt border border-gold/30 text-cream placeholder-cream/40
                           rounded px-3 py-2 text-xs outline-none
                           focus:border-gold/70 transition-all w-full"
              />
              {newNameError && <p className="text-danger-bright text-xs">{newNameError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="flex-1 bg-gold/20 text-gold text-xs py-1.5 rounded
                             hover:bg-gold/30 transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="flex-1 text-cream/65 text-xs py-1.5 rounded
                             hover:text-cream/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {mode === "joining" && (
            <form onSubmit={handleJoin} className="p-3 flex flex-col gap-2 border-b border-gold/10">
              <input
                ref={joinInputRef}
                type="text"
                value={joinInput}
                onChange={(e) => { setJoinInput(e.target.value); setJoinError(""); }}
                placeholder="Paste link or group ID"
                className="bg-felt border border-gold/30 text-cream placeholder-cream/40
                           rounded px-3 py-2 text-xs outline-none
                           focus:border-gold/70 transition-all w-full"
              />
              {joinError && <p className="text-danger-bright text-xs">{joinError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gold/20 text-gold text-xs py-1.5 rounded
                             hover:bg-gold/30 transition-colors"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="flex-1 text-cream/65 text-xs py-1.5 rounded
                             hover:text-cream/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Static bottom links */}
          <div>
            <Link
              href={`/g/${currentGroupId}/stats`}
              onClick={closeAll}
              className="block px-4 py-2.5 text-cream/70 text-sm
                         hover:bg-white/5 hover:text-cream transition-colors"
            >
              Stats
            </Link>
            <Link
              href={`/g/${currentGroupId}/history`}
              onClick={closeAll}
              className="block px-4 py-2.5 text-cream/70 text-sm
                         hover:bg-white/5 hover:text-cream transition-colors"
            >
              History
            </Link>
            <a
              href="https://github.com/MartinMajor/lunch-dice"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-cream/70 text-sm
                         hover:bg-white/5 hover:text-cream transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
