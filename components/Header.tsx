"use client";

import Link from "next/link";
import GroupSwitcher from "./GroupSwitcher";

interface Props {
  groupId: string;
  groupName: string;
}

export default function Header({ groupId, groupName }: Props) {
  return (
    <header className="border-b border-gold/20 px-4 py-3 flex items-center justify-between">
      <Link href={`/g/${groupId}`} className="font-display text-gold text-sm tracking-wider hover:text-gold-light transition-colors">Lunch Dice</Link>
      <GroupSwitcher currentGroupId={groupId} currentGroupName={groupName} />
    </header>
  );
}
