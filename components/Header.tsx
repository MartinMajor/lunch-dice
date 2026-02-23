"use client";

import { useState } from "react";
import Link from "next/link";
import GroupSwitcher from "./GroupSwitcher";

interface Props {
  groupId: string;
  groupName: string;
}

export default function Header({ groupId, groupName }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/g/${groupId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select and copy
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

  return (
    <header className="border-b border-gold/20 px-4 py-3 flex items-center justify-between">
      {/* Left: Share + History */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleShare}
          className="text-xs text-cream/50 hover:text-cream transition-colors
                     flex items-center gap-1.5"
        >
          <span>{copied ? "✓ Copied" : "⬡ Share"}</span>
        </button>
        <Link
          href={`/g/${groupId}/history`}
          className="text-xs text-cream/30 hover:text-cream/60 transition-colors"
        >
          History
        </Link>
      </div>

      {/* Right: Group switcher */}
      <GroupSwitcher currentGroupId={groupId} currentGroupName={groupName} />
    </header>
  );
}
