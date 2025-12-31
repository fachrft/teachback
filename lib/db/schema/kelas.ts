import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { profile } from "./user.schema";

export const kelas = pgTable("kelas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  kode: varchar("kode").notNull().unique(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profile.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kelas_member = pgTable("kelas_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  kelasId: uuid("kelas_id")
    .notNull()
    .references(() => kelas.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
