import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { materi } from "./materi";

export const flashcard = pgTable("flashcard", {
  id: uuid("id").defaultRandom().primaryKey(),
  materiId: uuid("materi_id")
    .notNull()
    .references(() => materi.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
