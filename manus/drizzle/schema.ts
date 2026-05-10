import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Outbreak cases table: tracks confirmed hantavirus cases by location.
 */
export const outbreakCases = mysqlTable("outbreak_cases", {
  id: int("id").autoincrement().primaryKey(),
  location: varchar("location", { length: 255 }).notNull(), // e.g., "South Africa", "Netherlands"
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  confirmedCount: int("confirmed_count").default(0).notNull(),
  suspectedCount: int("suspected_count").default(0).notNull(),
  deaths: int("deaths").default(0).notNull(),
  dateReported: timestamp("date_reported").notNull(),
  severityLevel: mysqlEnum("severity_level", ["low", "moderate", "high", "critical"]).default("moderate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type OutbreakCase = typeof outbreakCases.$inferSelect;
export type InsertOutbreakCase = typeof outbreakCases.$inferInsert;

/**
 * Signals table: stores parsed outbreak reports and news items.
 */
export const signals = mysqlTable("signals", {
  id: int("id").autoincrement().primaryKey(),
  sourceUrl: varchar("source_url", { length: 512 }),
  headline: varchar("headline", { length: 512 }).notNull(),
  summary: text("summary").notNull(), // AI-generated or extracted summary
  region: varchar("region", { length: 255 }),
  datePublished: timestamp("date_published").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = typeof signals.$inferInsert;

/**
 * Email subscribers table: stores newsletter signup emails.
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  verified: int("verified").default(0).notNull(), // 0 = false, 1 = true (MySQL doesn't have native boolean)
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;