import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { groups, sessions, sessionPlayers } from "@/lib/schema";

interface SessionPlayerInput {
  playerId: string;
  price: number;
  rolledScore: number;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { players: inputs }: { players: SessionPlayerInput[] } = await req.json();

  if (!Array.isArray(inputs) || inputs.length < 2) {
    return NextResponse.json(
      { error: "At least 2 players required" },
      { status: 400 }
    );
  }

  for (const p of inputs) {
    if (!p.playerId || p.price <= 0) {
      return NextResponse.json(
        { error: "Each player needs a valid playerId and price > 0" },
        { status: 400 }
      );
    }
  }

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, id),
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const [session] = await db
    .insert(sessions)
    .values({ groupId: id })
    .returning();

  await db.insert(sessionPlayers).values(
    inputs.map((p) => ({
      sessionId: session.id,
      playerId: p.playerId,
      price: p.price,
      rolledScore: p.rolledScore,
    }))
  );

  return NextResponse.json({ sessionId: session.id }, { status: 201 });
}
