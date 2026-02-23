"use client";

import { useEffect } from "react";
import { useLocalGroups } from "@/hooks/useLocalGroups";
import Header from "@/components/Header";

interface Group {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
}

interface Props {
  group: Group;
  initialRoster: Player[];
}

export default function GameClient({ group, initialRoster }: Props) {
  const { addGroup } = useLocalGroups();

  useEffect(() => {
    addGroup(group.id, group.name);
  }, [group.id, group.name, addGroup]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-cream/30 text-sm">
          {initialRoster.length} player{initialRoster.length !== 1 ? "s" : ""} in roster
        </p>
      </main>
    </div>
  );
}
