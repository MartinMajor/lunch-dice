import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players } from "@/lib/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const roster = await db
    .select()
    .from(players)
    .where(eq(players.groupId, id))
    .orderBy(players.createdAt);

  return NextResponse.json({ ...group, roster });
}
