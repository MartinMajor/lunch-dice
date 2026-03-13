"use client";

import Link from "next/link";
import { useState } from "react";
import FormattedDate from "@/components/FormattedDate";

export interface PlayerStat {
  playerId: string;
  name: string;
  plays: number;
  paidTimes: number;
  didntPayTimes: number;
  expectedPay: number;
  actualPay: number;
  balance: number;
  avgPrice: number;
  biggestBill: number;
  lastPaid: string | null;
  streak: { count: number; paid: boolean } | null;
}

export interface GroupStat {
  totalGames: number;
  totalBill: number;
}

interface Props {
  groupId: string;
  groupStat: GroupStat;
  playerStats: PlayerStat[];
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtBalance(n: number) {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}


function StatTile({
  value,
  label,
  valueClass = "text-cream",
}: {
  value: React.ReactNode;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-gold/15 p-3 flex flex-col gap-1">
      <span className={`text-xl font-mono font-bold tabular-nums leading-tight ${valueClass}`}>
        {value}
      </span>
      <span className="text-[10px] text-cream/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function StatsClient({ groupId, groupStat, playerStats }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? (playerStats.find((p) => p.playerId === selectedId) ?? null)
    : null;

  if (selected) {
    const streakClass =
      selected.streak == null
        ? "text-cream/60"
        : selected.streak.paid
        ? "text-danger-bright"
        : "text-safe";
    const streakLabel =
      selected.streak == null ? "streak" : selected.streak.paid ? "paid streak" : "safe streak";
    const streakValue = selected.streak ? `${selected.streak.count}×` : "—";

    return (
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 gap-6">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1 text-cream/60 hover:text-cream text-xs
                     transition-colors self-start mt-2"
        >
          ← Stats
        </button>

        <h2 className="font-display text-gold tracking-wider text-lg -mt-2">
          {selected.name}
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <StatTile value={selected.plays} label="Plays" />
          <StatTile value={selected.paidTimes} label="Paid" />
          <StatTile value={selected.didntPayTimes} label="Safe" />
          <StatTile value={fmt(selected.avgPrice)} label="Avg price" />
          <StatTile value={fmt(selected.expectedPay)} label="Expected paid" />
          <StatTile value={fmt(selected.actualPay)} label="Actual paid" />
          <StatTile
            value={fmtBalance(selected.balance)}
            label="Balance"
            valueClass={selected.balance >= 0 ? "text-safe" : "text-danger-bright"}
          />
          <StatTile
            value={selected.biggestBill > 0 ? fmt(selected.biggestBill) : "—"}
            label="Biggest bill"
          />
          <StatTile
            value={selected.lastPaid ? <FormattedDate iso={selected.lastPaid} /> : "Never"}
            label="Last paid"
          />
          <StatTile value={streakValue} label={streakLabel} valueClass={streakClass} />
        </div>
      </main>
    );
  }

  const sorted = [...playerStats].sort((a, b) => b.balance - a.balance);

  return (
    <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 gap-6">
      <Link
        href={`/g/${groupId}`}
        className="text-cream/60 hover:text-cream text-xs transition-colors self-start mt-2"
      >
        ← Game
      </Link>

      {groupStat.totalGames === 0 ? (
        <p className="text-cream/60 text-sm text-center py-12">No games played yet.</p>
      ) : (
        <>
          <p className="text-cream/60 text-xs uppercase tracking-widest text-center">
            {groupStat.totalGames} {groupStat.totalGames === 1 ? "game" : "games"}
            {" · "}
            {fmt(groupStat.totalBill)} total
          </p>

          <div className="flex flex-col divide-y divide-gold/10">
            {sorted.map((p) => (
              <button
                key={p.playerId}
                onClick={() => setSelectedId(p.playerId)}
                className="flex items-center justify-between py-3.5 hover:bg-white/5
                           transition-colors -mx-2 px-2 rounded"
              >
                <span className="text-cream text-sm font-display tracking-wide">{p.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-mono tabular-nums font-bold
                      ${p.balance >= 0 ? "text-safe" : "text-danger-bright"}`}
                  >
                    {fmtBalance(p.balance)}
                  </span>
                  <span className="text-cream/30 text-xs">›</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-cream/40 text-[10px] text-center uppercase tracking-widest">
            Balance = expected − actual · + is lucky
          </p>
        </>
      )}
    </main>
  );
}
