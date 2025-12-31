import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { materi } from "./materi";
import { profile } from "./user.schema";

export const assignment = pgTable("assignment", {
  id: uuid("id").defaultRandom().primaryKey(),
  materiId: uuid("materi_id")
    .notNull()
    .references(() => materi.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  instructions: text("instructions"),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const assignment_submission = pgTable("assignment_submission", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignment.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  fileUrl: varchar("file_url").notNull(),
  grade: integer("grade"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});
