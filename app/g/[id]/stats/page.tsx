import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players, sessions, sessionPlayers } from "@/lib/schema";
import Header from "@/components/Header";
import StatsClient, { GroupStat, PlayerStat } from "./StatsClient";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const group = await db.query.groups.findFirst({ where: eq(groups.id, id) });
  if (!group) notFound();

  const rows = await db
    .select({
      playerId: players.id,
      playerName: players.name,
      sessionId: sessions.id,
      playedAt: sessions.playedAt,
      price: sessionPlayers.price,
      rolledScore: sessionPlayers.rolledScore,
    })
    .from(sessionPlayers)
    .innerJoin(sessions, eq(sessions.id, sessionPlayers.sessionId))
    .innerJoin(players, eq(players.id, sessionPlayers.playerId))
    .where(eq(sessions.groupId, id))
    .orderBy(sessions.playedAt);

  // ── Session index ───────────────────────────────────────────────

  const sessionIndex = new Map<
    string,
    { playedAt: Date; totalBill: number; payerId: string; payerMinScore: number }
  >();

  for (const row of rows) {
    if (!sessionIndex.has(row.sessionId)) {
      sessionIndex.set(row.sessionId, {
        playedAt: row.playedAt,
        totalBill: 0,
        payerId: "",
        payerMinScore: Infinity,
      });
    }
    const s = sessionIndex.get(row.sessionId)!;
    s.totalBill += row.price;
    if (row.rolledScore < s.payerMinScore) {
      s.payerMinScore = row.rolledScore;
      s.payerId = row.playerId;
    }
  }

  // ── Player index ────────────────────────────────────────────────

  const playerIndex = new Map<
    string,
    {
      name: string;
      sessions: Array<{ playedAt: Date; price: number; paid: boolean; totalBill: number }>;
    }
  >();

  for (const row of rows) {
    if (!playerIndex.has(row.playerId)) {
      playerIndex.set(row.playerId, { name: row.playerName, sessions: [] });
    }
    const s = sessionIndex.get(row.sessionId)!;
    playerIndex.get(row.playerId)!.sessions.push({
      playedAt: row.playedAt,
      price: row.price,
      paid: s.payerId === row.playerId,
      totalBill: s.totalBill,
    });
  }

  // ── Per-player stats ────────────────────────────────────────────

  const playerStats: PlayerStat[] = Array.from(playerIndex.entries()).map(
    ([playerId, { name, sessions: ps }]) => {
      const sorted = [...ps].sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
      const paidSessions = sorted.filter((s) => s.paid);
      const expectedPay = sorted.reduce((sum, s) => sum + s.price, 0);
      const actualPay = paidSessions.reduce((sum, s) => sum + s.totalBill, 0);
      const biggestBill =
        paidSessions.length > 0 ? Math.max(...paidSessions.map((s) => s.totalBill)) : 0;
      const lastPaidDate = [...paidSessions].sort(
        (a, b) => b.playedAt.getTime() - a.playedAt.getTime()
      )[0]?.playedAt;

      // Streak: reverse-chronological, count consecutive same outcome
      const reversed = [...sorted].reverse();
      let streakCount = 0;
      let streakPaid: boolean | null = null;
      for (const s of reversed) {
        if (streakPaid === null) {
          streakPaid = s.paid;
          streakCount = 1;
        } else if (s.paid === streakPaid) {
          streakCount++;
        } else {
          break;
        }
      }

      return {
        playerId,
        name,
        plays: sorted.length,
        paidTimes: paidSessions.length,
        didntPayTimes: sorted.length - paidSessions.length,
        expectedPay,
        actualPay,
        balance: expectedPay - actualPay,
        avgPrice: sorted.length > 0 ? expectedPay / sorted.length : 0,
        biggestBill,
        lastPaid: lastPaidDate?.toISOString() ?? null,
        streak: sorted.length > 0 ? { count: streakCount, paid: streakPaid! } : null,
      };
    }
  );

  // ── Group stats ─────────────────────────────────────────────────

  const groupStat: GroupStat = {
    totalGames: sessionIndex.size,
    totalBill: Array.from(sessionIndex.values()).reduce((sum, s) => sum + s.totalBill, 0),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />
      <StatsClient groupId={group.id} groupStat={groupStat} playerStats={playerStats} />
    </div>
  );
}
