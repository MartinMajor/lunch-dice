import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { groups } from "@/lib/schema";

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = nanoid(16);
  const [group] = await db
    .insert(groups)
    .values({ id, name: name.trim() })
    .returning();

  return NextResponse.json(group, { status: 201 });
}
