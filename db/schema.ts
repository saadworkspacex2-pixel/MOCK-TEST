import {
  pgSchema,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
} from "drizzle-orm/pg-core";

export const appSchema = pgSchema("lhbd_app");

export const exams = appSchema.table("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("সাধারণ জ্ঞান"),
  module: text("module").notNull().default("mcq"), // mcq | reading | listening | writing
  durationMinutes: integer("duration_minutes").notNull().default(20),
  marksPerQuestion: real("marks_per_question").notNull().default(1),
  negativeMark: real("negative_mark").notNull().default(0),
  isLive: boolean("is_live").notNull().default(true),
  rules: jsonb("rules").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Passage parts for reading tests / task prompts for writing tests
export const sections = appSchema.table("sections", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Part 1"),
  passageTitle: text("passage_title").notNull().default(""),
  passageText: text("passage_text").notNull().default(""),
  instruction: text("instruction").notNull().default(""),
  audioUrl: text("audio_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Uploaded files (audio, fonts, images, PDFs) stored in DB so they survive rebuilds
export const media = appSchema.table("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  data: text("data").notNull(), // base64
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = appSchema.table("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  sectionId: integer("section_id").references(() => sections.id, {
    onDelete: "cascade",
  }),
  qtype: text("qtype").notNull().default("mcq"),
  text: text("text").notNull(),
  optionA: text("option_a").notNull().default(""),
  optionB: text("option_b").notNull().default(""),
  optionC: text("option_c").notNull().default(""),
  optionD: text("option_d").notNull().default(""),
  correctOption: integer("correct_option").notNull().default(0),
  acceptedAnswers: text("accepted_answers").notNull().default(""),
  explanation: text("explanation").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const users = appSchema.table("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  nameEn: text("name_en").notNull().default(""),
  nameBn: text("name_bn").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  avatar: text("avatar").notNull().default(""), // data URL
  sessionToken: text("session_token").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = appSchema.table("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const attempts = appSchema.table("attempts", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  studentName: text("student_name").notNull(),
  score: real("score").notNull().default(0),
  bandScore: real("band_score"),
  correctCount: integer("correct_count").notNull().default(0),
  wrongCount: integer("wrong_count").notNull().default(0),
  skippedCount: integer("skipped_count").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  timeTakenSeconds: integer("time_taken_seconds").notNull().default(0),
  answers: jsonb("answers").notNull().default({}),
  essayText: text("essay_text").notNull().default(""),
  status: text("status").notNull().default("scored"),
  feedback: jsonb("feedback").notNull().default({}),
  ip: text("ip").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pageSections = appSchema.table("page_sections", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().default("home"),
  type: text("type").notNull().default("html"),
  title: text("title").notNull().default(""),
  content: jsonb("content").notNull().default({}),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const staff = appSchema.table("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  role: text("role").notNull().default("content"),
  sessionToken: text("session_token").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const examSessions = appSchema.table("exam_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  studentName: text("student_name").notNull().default(""),
  submitted: boolean("submitted").notNull().default(false),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const resources = appSchema.table("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("সাধারণ"),
  type: text("type").notNull().default("article"),
  url: text("url").notNull().default("#"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Exam = typeof exams.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Resource = typeof resources.$inferSelect;
