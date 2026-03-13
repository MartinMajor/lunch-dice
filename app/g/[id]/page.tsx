import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players, sessions, sessionPlayers } from "@/lib/schema";
import GameClient from "./GameClient";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
  });

  if (!group) notFound();

  const roster = await db
    .select({ id: players.id, name: players.name })
    .from(players)
    .leftJoin(sessionPlayers, eq(sessionPlayers.playerId, players.id))
    .leftJoin(sessions, eq(sessions.id, sessionPlayers.sessionId))
    .where(eq(players.groupId, id))
    .groupBy(players.id)
    .orderBy(sql`MAX(${sessions.playedAt}) DESC NULLS LAST`);

  return <GameClient group={group} initialRoster={roster} />;
}
