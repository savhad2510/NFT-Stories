import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").unique().notNull(),
  title: text("title").notNull(),
  currentChapter: text("current_chapter").notNull(),
  owner: text("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertStorySchema = createInsertSchema(stories, {
  tokenId: z.string(),
  title: z.string().min(3),
  currentChapter: z.string().optional(),
  owner: z.string(),
}).extend({
  prompt: z.string().min(10),
});
export const selectStorySchema = createSelectSchema(stories);
export type Story = typeof stories.$inferSelect;
export type NewStory = z.infer<typeof insertStorySchema>;