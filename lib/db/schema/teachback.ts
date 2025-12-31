import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { profile } from "./user.schema";
import { materi } from "./materi";
import { kelas } from "./kelas";

export const submissionStatusEnum = pgEnum("submission_status", [
  "PENDING",
  "REVIEWED",
  "REJECTED",
]);

export const teachback_submission = pgTable("teachback_submission", {
  id: uuid("id").defaultRandom().primaryKey(),
  materiId: uuid("materi_id")
    .notNull()
    .references(() => materi.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  kelasId: uuid("kelas_id")
    .notNull()
    .references(() => kelas.id, { onDelete: "cascade" }),
  transcript: jsonb("transcript"), // Chat history lengkap
  feedback: text("feedback"), // Feedback manual dari guru
  score: integer("score"), // Nilai (0-100), bisa auto-fill AI tapi editable Guru
  status: submissionStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
