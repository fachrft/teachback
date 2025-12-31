import { profile } from "./user.schema";
import { kelas, kelas_member } from "./kelas";
import { materi, materi_kelas } from "./materi";
import { teachback_submission } from "./teachback";
import { quiz, quiz_question, quiz_attempt, quiz_answer } from "./quiz";
import { assignment, assignment_submission } from "./assignment";
import { flashcard } from "./flashcard";
import { relations } from "drizzle-orm";

export const profileRelation = relations(profile, ({ many }) => ({
  kelas: many(kelas),
  materi: many(materi),
  kelasMember: many(kelas_member),
  submissions: many(teachback_submission),
  quizAttempts: many(quiz_attempt),
  assignmentSubmissions: many(assignment_submission),
}));

export const kelasRelation = relations(kelas, ({ one, many }) => ({
  profile: one(profile, {
    fields: [kelas.createdBy],
    references: [profile.id],
  }),
  materi_kelas: many(materi_kelas),
  kelasMember: many(kelas_member),
  submissions: many(teachback_submission),
}));

// pivot table siswa dan kelas
export const kelasMemberRelation = relations(kelas_member, ({ one }) => ({
  kelas: one(kelas, {
    fields: [kelas_member.kelasId],
    references: [kelas.id],
  }),
  profile: one(profile, {
    fields: [kelas_member.userId],
    references: [profile.id],
  }),
}));

export const materiRelation = relations(materi, ({ one, many }) => ({
  profile: one(profile, {
    fields: [materi.createdBy],
    references: [profile.id],
  }),
  materi_kelas: many(materi_kelas),
  submissions: many(teachback_submission),
  quizzes: many(quiz),
  assignments: many(assignment),
  flashcards: many(flashcard),
}));

export const teachbackSubmissionRelation = relations(
  teachback_submission,
  ({ one }) => ({
    materi: one(materi, {
      fields: [teachback_submission.materiId],
      references: [materi.id],
    }),
    student: one(profile, {
      fields: [teachback_submission.studentId],
      references: [profile.id],
    }),
    kelas: one(kelas, {
      fields: [teachback_submission.kelasId],
      references: [kelas.id],
    }),
  })
);

export const quizRelation = relations(quiz, ({ one, many }) => ({
  materi: one(materi, {
    fields: [quiz.materiId],
    references: [materi.id],
  }),
  questions: many(quiz_question),
  attempts: many(quiz_attempt),
}));

export const quizQuestionRelation = relations(
  quiz_question,
  ({ one, many }) => ({
    quiz: one(quiz, {
      fields: [quiz_question.quizId],
      references: [quiz.id],
    }),
    answers: many(quiz_answer),
  })
);

export const quizAttemptRelation = relations(quiz_attempt, ({ one, many }) => ({
  student: one(profile, {
    fields: [quiz_attempt.studentId],
    references: [profile.id],
  }),
  quiz: one(quiz, {
    fields: [quiz_attempt.quizId],
    references: [quiz.id],
  }),
  answers: many(quiz_answer),
}));

export const quizAnswerRelation = relations(quiz_answer, ({ one }) => ({
  attempt: one(quiz_attempt, {
    fields: [quiz_answer.attemptId],
    references: [quiz_attempt.id],
  }),
  question: one(quiz_question, {
    fields: [quiz_answer.questionId],
    references: [quiz_question.id],
  }),
}));

export const assignmentRelation = relations(assignment, ({ one, many }) => ({
  materi: one(materi, {
    fields: [assignment.materiId],
    references: [materi.id],
  }),
  submissions: many(assignment_submission),
}));

export const assignmentSubmissionRelation = relations(
  assignment_submission,
  ({ one }) => ({
    assignment: one(assignment, {
      fields: [assignment_submission.assignmentId],
      references: [assignment.id],
    }),
    student: one(profile, {
      fields: [assignment_submission.studentId],
      references: [profile.id],
    }),
  })
);

// pivot table materi dan kelas, jadi 1 kelas punya BANYAK materi
export const materi_kelasRelation = relations(materi_kelas, ({ one }) => ({
  kelas: one(kelas, {
    fields: [materi_kelas.kelasId],
    references: [kelas.id],
  }),
  materi: one(materi, {
    fields: [materi_kelas.materiId],
    references: [materi.id],
  }),
}));

export const flashcardRelation = relations(flashcard, ({ one }) => ({
  materi: one(materi, {
    fields: [flashcard.materiId],
    references: [materi.id],
  }),
}));
