import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Card Schema
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  cardName: text("card_name").notNull(),
  subject: text("subject").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Review Schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  reviewDate: date("review_date").defaultNow().notNull(),
  familiarityScore: integer("familiarity_score").notNull(),
  interval: integer("interval").notNull(),
  nextReviewDate: date("next_review_date").notNull(),
});

// Subject Schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Create Zod schemas for validation
export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

// Types for insert operations
export type InsertCard = z.infer<typeof insertCardSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

// Types for select operations
export type Card = typeof cards.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Subject = typeof subjects.$inferSelect;

// Type for card with review data
export type CardWithReview = Card & {
  lastReview?: Review;
};
