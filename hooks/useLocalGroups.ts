"use client";

import { useCallback, useEffect, useState } from "react";

export interface LocalGroup {
  id: string;
  name: string;
  lastVisited: string; // ISO timestamp
}

const STORAGE_KEY = "lunch-dice-groups";

function readGroups(): LocalGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGroups(groups: LocalGroup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function useLocalGroups() {
  const [groups, setGroups] = useState<LocalGroup[]>([]);

  useEffect(() => {
    setGroups(readGroups().sort(byLastVisited));
  }, []);

  const addGroup = useCallback((id: string, name: string) => {
    const existing = readGroups();
    const filtered = existing.filter((g) => g.id !== id);
    const updated: LocalGroup[] = [
      { id, name, lastVisited: new Date().toISOString() },
      ...filtered,
    ].sort(byLastVisited);
    writeGroups(updated);
    setGroups(updated);
  }, []);

  const getLastGroup = useCallback((): LocalGroup | null => {
    const all = readGroups().sort(byLastVisited);
    return all[0] ?? null;
  }, []);

  return { groups, addGroup, getLastGroup };
}

function byLastVisited(a: LocalGroup, b: LocalGroup): number {
  return new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime();
}
