import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players, sessions, sessionPlayers } from "@/lib/schema";
import Header from "@/components/Header";
import FormattedDate from "@/components/FormattedDate";

export default async function HistoryPage({
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

  // Build per-session data
  const sessionIndex = new Map<
    string,
    {
      sessionId: string;
      playedAt: Date;
      totalBill: number;
      payerName: string;
      payerMinScore: number;
      playerNames: string[];
    }
  >();

  for (const row of rows) {
    if (!sessionIndex.has(row.sessionId)) {
      sessionIndex.set(row.sessionId, {
        sessionId: row.sessionId,
        playedAt: row.playedAt,
        totalBill: 0,
        payerName: "",
        payerMinScore: Infinity,
        playerNames: [],
      });
    }
    const s = sessionIndex.get(row.sessionId)!;
    s.totalBill += row.price;
    s.playerNames.push(row.playerName);
    if (row.rolledScore < s.payerMinScore) {
      s.payerMinScore = row.rolledScore;
      s.payerName = row.playerName;
    }
  }

  const sessionList = Array.from(sessionIndex.values()).sort(
    (a, b) => b.playedAt.getTime() - a.playedAt.getTime()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header groupId={group.id} groupName={group.name} />

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 gap-6">
        <Link
          href={`/g/${id}`}
          className="text-cream/60 hover:text-cream text-xs transition-colors self-start mt-2"
        >
          ← Game
        </Link>

        {sessionList.length === 0 ? (
          <p className="text-cream/60 text-sm text-center py-12">No games played yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessionList.map((s) => (
              <div
                key={s.sessionId}
                className="rounded-lg border border-gold/15 bg-white/3 px-4 py-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cream/60 text-xs"><FormattedDate iso={s.playedAt.toISOString()} /></span>
                  <span className="text-gold font-mono text-sm tabular-nums">
                    ${s.totalBill.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-danger-bright text-sm font-display tracking-wide">
                    {s.payerName}
                  </span>
                  <span className="text-cream/40 text-xs">pays</span>
                </div>
                <p className="text-cream/50 text-xs">{s.playerNames.join(" · ")}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
