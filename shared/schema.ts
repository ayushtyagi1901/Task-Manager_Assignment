import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { integer } from "drizzle-orm/pg-core";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const specs = pgTable("specs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  goal: text("goal").notNull(),
  targetUsers: text("target_users").notNull(),
  constraints: text("constraints").notNull(),
  risks: text("risks"),
  template: text("template"), // "Web", "Mobile", "Internal Tool"
  createdAt: timestamp("created_at").defaultNow(),
});

export const generatedOutputs = pgTable("generated_outputs", {
  id: serial("id").primaryKey(),
  specId: integer("spec_id").notNull().references(() => specs.id),
  userStories: jsonb("user_stories").$type<{
    number: number;
    title: string;
    asA: string; // "As a [role]"
    iWant: string; // "I want [goal]"
    soThat: string; // "so that [benefit]"
    acceptanceCriteria: {
      given: string;
      when: string;
      then: string;
    }[];
  }[]>(), // Structured user stories
  engineeringTasks: jsonb("engineering_tasks").$type<{
    id: string;
    title: string;
    description?: string;
    group: string; // Epic or Section
  }[]>(), // JSON structure for D&D
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSpecSchema = createInsertSchema(specs).omit({ id: true, createdAt: true, userId: true });
export const insertGeneratedOutputSchema = createInsertSchema(generatedOutputs).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Spec = typeof specs.$inferSelect;
export type InsertSpec = z.infer<typeof insertSpecSchema>;

export type GeneratedOutput = typeof generatedOutputs.$inferSelect;
export type InsertGeneratedOutput = z.infer<typeof insertGeneratedOutputSchema>;

// Request types
export type CreateSpecRequest = InsertSpec;
export type UpdateTasksRequest = {
  tasks: GeneratedOutput["engineeringTasks"];
};

// Response types
export type SpecWithOutputResponse = Spec & {
  output?: GeneratedOutput;
};

// Status response
export interface StatusResponse {
  backend: boolean;
  database: boolean;
  llm: boolean;
}
