import { pgTable, varchar, text, timestamp, uuid, real } from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
  id: varchar("id", { length: 16 }).primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: varchar("group_id", { length: 16 })
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: varchar("group_id", { length: 16 })
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

export const sessionPlayers = pgTable("session_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  price: real("price").notNull(),
  rolledScore: real("rolled_score").notNull(),
});
