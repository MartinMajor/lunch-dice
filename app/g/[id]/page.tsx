import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players } from "@/lib/schema";
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
    .select()
    .from(players)
    .where(eq(players.groupId, id))
    .orderBy(players.createdAt);

  return <GameClient group={group} initialRoster={roster} />;
}
