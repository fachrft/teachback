import { pgTable, text, uuid, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const roles = pgEnum("roles", ["guru", "siswa"]);
export const profile = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  name: text("name").notNull(),
  role: roles().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
