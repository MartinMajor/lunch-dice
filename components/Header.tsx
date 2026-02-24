"use client";

import GroupSwitcher from "./GroupSwitcher";

interface Props {
  groupId: string;
  groupName: string;
}

export default function Header({ groupId, groupName }: Props) {
  return (
    <header className="border-b border-gold/20 px-4 py-3 flex items-center justify-between">
      <span className="font-display text-gold text-sm tracking-wider">Lunch Dice</span>
      <GroupSwitcher currentGroupId={groupId} currentGroupName={groupName} />
    </header>
  );
}
