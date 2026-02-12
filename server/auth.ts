import type { Request } from "express";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: number;
  email: string;
}

// Generate JWT token
export function generateToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from authorization header
export async function getUserFromRequest(req: Request): Promise<{ id: number; email?: string } | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }

  // Verify user still exists
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  
  if (!user[0]) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
  };
}

// Get user from session cookie (for cookie-based auth)
export async function getUserFromSession(req: Request): Promise<{ id: number; email?: string } | null> {
  // Check for session token in cookies
  const sessionToken = req.cookies?.session_token;
  
  if (!sessionToken) {
    return null;
  }

  const payload = verifyToken(sessionToken);
  
  if (!payload) {
    return null;
  }

  // Verify user still exists
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  
  if (!user[0]) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
  };
}
