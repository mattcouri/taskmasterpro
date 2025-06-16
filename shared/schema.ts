import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  color: text("color").default("#3B82F6"),
  date: date("date").notNull(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  estimatedDuration: integer("estimated_duration").default(30), // in minutes
  completed: boolean("completed").default(false),
  projectId: integer("project_id"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#7C3AED"),
});

export const scheduledItems = pgTable("scheduled_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(),
  duration: integer("duration").notNull(),
  date: date("date").notNull(),
  type: text("type").notNull(), // meeting, todo, custom
  originalId: integer("original_id"), // reference to original meeting or todo
  color: text("color").default("#6B7280"),
});

export const passwords = pgTable("passwords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  siteName: text("site_name").notNull(),
  url: text("url"),
  username: text("username"),
  email: text("email"),
  password: text("password").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  unit: text("unit"),
  category: text("category").notNull(),
  startDate: date("start_date").notNull(),
  targetDate: date("target_date"),
  isActive: boolean("is_active").default(true),
});

export const habitTracking = pgTable("habit_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // completed, not_completed, not_applicable, partial
  iconKey: text("icon_key").notNull(),
});

export const habitLegends = pgTable("habit_legends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  iconKey: text("icon_key").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  color: text("color").notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // checking, savings, credit, investment
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // income, expense, transfer
  category: text("category").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  weeklyAllocation: decimal("weekly_allocation", { precision: 12, scale: 2 }),
  targetDate: date("target_date"),
  isActive: boolean("is_active").default(true),
});

export const healthScores = pgTable("health_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  spiritualScore: integer("spiritual_score").default(1),
  mentalScore: integer("mental_score").default(1),
  socialScore: integer("social_score").default(1),
  physicalScore: integer("physical_score").default(1),
  financialScore: integer("financial_score").default(1),
  notes: text("notes"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export const insertTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertScheduledItemSchema = createInsertSchema(scheduledItems).omit({ id: true });
export const insertPasswordSchema = createInsertSchema(passwords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export const insertHabitTrackingSchema = createInsertSchema(habitTracking).omit({ id: true });
export const insertHabitLegendSchema = createInsertSchema(habitLegends).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertFinancialGoalSchema = createInsertSchema(financialGoals).omit({ id: true });
export const insertHealthScoreSchema = createInsertSchema(healthScores).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ScheduledItem = typeof scheduledItems.$inferSelect;
export type InsertScheduledItem = z.infer<typeof insertScheduledItemSchema>;
export type Password = typeof passwords.$inferSelect;
export type InsertPassword = z.infer<typeof insertPasswordSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type HabitTracking = typeof habitTracking.$inferSelect;
export type InsertHabitTracking = z.infer<typeof insertHabitTrackingSchema>;
export type HabitLegend = typeof habitLegends.$inferSelect;
export type InsertHabitLegend = z.infer<typeof insertHabitLegendSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type HealthScore = typeof healthScores.$inferSelect;
export type InsertHealthScore = z.infer<typeof insertHealthScoreSchema>;
