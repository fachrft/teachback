import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { profile } from "./user.schema";
import { kelas } from "./kelas";

interface BooleanFlags {
  quiz: boolean;
  teachback: boolean;
  assignment: boolean;
}

export const materi = pgTable("materi", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  fileUrl: varchar("file_url"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profile.id),
  flags: jsonb("flags")
    .$type<BooleanFlags>()
    .default({ quiz: false, teachback: false, assignment: false }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const materi_kelas = pgTable("materi_kelas", {
  id: uuid("id").defaultRandom().primaryKey(),
  kelasId: uuid("kelas_id")
    .notNull()
    .references(() => kelas.id, { onDelete: "cascade" }),
  materiId: uuid("materi_id")
    .notNull()
    .references(() => materi.id, { onDelete: "cascade" }),
});
