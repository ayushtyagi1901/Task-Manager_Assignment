import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { generatePlan, checkLLMHealth } from "./gemini";
import { db } from "./db";
import { sql, eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getUserFromRequest, getUserFromSession, generateToken } from "./auth";
import { users } from "@shared/schema";
import { formatDatabaseError } from "./error-handler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === AUTH ROUTES ===

  // Sign up
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }).parse(req.body);

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser[0]) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
      }).returning();

      // Generate token
      const token = generateToken(newUser.id, newUser.email);

      // Set cookie
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        user: { id: newUser.id, email: newUser.email },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // Check if it's a database error
      if (err?.code?.startsWith("42") || err?.code?.startsWith("23") || err?.message?.includes("relation")) {
        const { message, status } = formatDatabaseError(err);
        return res.status(status).json({ message });
      }
      throw err;
    }
  });

  // Sign in
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string(),
      }).parse(req.body);

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      // Set cookie
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: { id: user.id, email: user.email },
        token,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // Check if it's a database error
      if (err?.code?.startsWith("42") || err?.code?.startsWith("23") || err?.message?.includes("relation")) {
        const { message, status } = formatDatabaseError(err);
        return res.status(status).json({ message });
      }
      throw err;
    }
  });

  // Sign out
  app.post("/api/auth/signout", async (_req, res) => {
    res.clearCookie("session_token");
    res.json({ message: "Signed out successfully" });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ id: user.id, email: user.email });
  });

  // === API ROUTES ===

  // List recent specs
  app.get(api.specs.list.path, async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const specs = await storage.getRecentSpecs(user.id);
    res.json(specs);
  });

  // Create new spec
  app.post(api.specs.create.path, async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const input = api.specs.create.input.parse(req.body);
      const spec = await storage.createSpec(input, user.id);
      res.status(201).json(spec);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get spec details
  app.get(api.specs.get.path, async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = Number(req.params.id);
    const spec = await storage.getSpec(id, user.id);
    if (!spec) {
      return res.status(404).json({ message: "Spec not found" });
    }
    const output = await storage.getGeneratedOutputBySpecId(id, user.id);
    res.json({ ...spec, output });
  });

  // Generate plan (LLM)
  app.post(api.specs.generate.path, async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = Number(req.params.id);
    const spec = await storage.getSpec(id, user.id);
    
    if (!spec) {
      return res.status(404).json({ message: "Spec not found" });
    }

    try {
      const plan = await generatePlan(spec);
      
      const output = await storage.createGeneratedOutput({
        specId: id,
        userStories: plan.userStories,
        engineeringTasks: plan.engineeringTasks,
      });

      res.json(output);
    } catch (error: any) {
      console.error("LLM Generation failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      res.status(500).json({ 
        message: "Failed to generate plan: " + (error.message || "Unknown error"),
        error: process.env.NODE_ENV === "development" ? error.stack : undefined
      });
    }
  });

  // Update tasks (reorder/edit)
  app.patch(api.specs.updateTasks.path, async (req, res) => {
    const user = await getUserFromRequest(req) || await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const id = Number(req.params.id);
    const output = await storage.getGeneratedOutputBySpecId(id, user.id);
    if (!output) {
      return res.status(404).json({ message: "Generated output not found for this spec" });
    }

    try {
      const input = api.specs.updateTasks.input.parse(req.body);
      const updated = await storage.updateGeneratedOutputTasks(output.id, input.tasks, user.id);
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Status check
  app.get(api.status.get.path, async (req, res) => {
    let dbStatus = false;
    try {
      await db.execute(sql`SELECT 1`);
      dbStatus = true;
    } catch (e) {
      console.error("DB Health check failed:", e);
    }

    const llmStatus = await checkLLMHealth();

    res.json({
      backend: true,
      database: dbStatus,
      llm: llmStatus,
    });
  });

  return httpServer;
}
