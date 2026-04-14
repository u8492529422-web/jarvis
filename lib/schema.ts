import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const habitLogs = sqliteTable("habit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  habitKey: text("habit_key").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

export const checkins = sqliteTable("checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  score: real("score").notNull().default(0),
  missedText: text("missed_text").notNull().default(""),
  goals: text("goals").notNull().default("[]"), // JSON array of 3 strings
  jarvisResponse: text("jarvis_response").notNull().default(""),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionDate: text("session_date").notNull(), // YYYY-MM-DD
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const memory = sqliteTable("memory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull().unique(), // 'medium' | 'long'
  content: text("content").notNull(),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
