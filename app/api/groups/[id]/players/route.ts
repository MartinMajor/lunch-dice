import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, players } from "@/lib/schema";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const [player] = await db
    .insert(players)
    .values({ groupId: id, name: name.trim() })
    .returning();

  return NextResponse.json(player, { status: 201 });
}
