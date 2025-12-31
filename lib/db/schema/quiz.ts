import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { materi } from "./materi";
import { profile } from "./user.schema";

export const quiz = pgTable("quiz", {
  id: uuid("id").defaultRandom().primaryKey(),
  materiId: uuid("materi_id")
    .notNull()
    .references(() => materi.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const quiz_question = pgTable("quiz_question", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quiz.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  type: varchar("type").notNull(), // 'multiple_choice' | 'essay'
  options: jsonb("options"), // Array of options for multiple choice
  correctAnswer: text("correct_answer"),
  order: integer("order").default(0),
});

export const quiz_attempt = pgTable("quiz_attempt", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quiz.id, { onDelete: "cascade" }),
  score: integer("score"),
  startedAt: timestamp("started_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const quiz_answer = pgTable("quiz_answer", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => quiz_attempt.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => quiz_question.id, { onDelete: "cascade" }),
  answer: text("answer"),
  isCorrect: boolean("is_correct"),
});
