import { db } from "./db";
import { specs, generatedOutputs, type Spec, type InsertSpec, type GeneratedOutput, type InsertGeneratedOutput } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Specs
  createSpec(spec: InsertSpec, userId: number): Promise<Spec>;
  getSpec(id: number, userId: number): Promise<Spec | undefined>;
  getRecentSpecs(userId: number, limit?: number): Promise<Spec[]>;
  
  // Generated Outputs
  createGeneratedOutput(output: InsertGeneratedOutput): Promise<GeneratedOutput>;
  getGeneratedOutputBySpecId(specId: number, userId: number): Promise<GeneratedOutput | undefined>;
  updateGeneratedOutputTasks(id: number, tasks: any, userId: number): Promise<GeneratedOutput>;
}

export class DatabaseStorage implements IStorage {
  async createSpec(spec: InsertSpec, userId: number): Promise<Spec> {
    const [newSpec] = await db.insert(specs).values({ ...spec, userId }).returning();
    return newSpec;
  }

  async getSpec(id: number, userId: number): Promise<Spec | undefined> {
    const [spec] = await db.select().from(specs).where(
      and(eq(specs.id, id), eq(specs.userId, userId))
    );
    return spec;
  }

  async getRecentSpecs(userId: number, limit: number = 5): Promise<Spec[]> {
    return db.select().from(specs)
      .where(eq(specs.userId, userId))
      .orderBy(desc(specs.createdAt))
      .limit(limit);
  }

  async createGeneratedOutput(output: InsertGeneratedOutput): Promise<GeneratedOutput> {
    const [newOutput] = await db.insert(generatedOutputs).values(output).returning();
    return newOutput;
  }

  async getGeneratedOutputBySpecId(specId: number, userId: number): Promise<GeneratedOutput | undefined> {
    // First verify the spec belongs to the user
    const spec = await this.getSpec(specId, userId);
    if (!spec) {
      return undefined;
    }
    
    // Then get the output
    const [output] = await db.select().from(generatedOutputs).where(eq(generatedOutputs.specId, specId));
    return output;
  }

  async updateGeneratedOutputTasks(id: number, tasks: any, userId: number): Promise<GeneratedOutput> {
    // Verify user owns the spec before updating
    const output = await this.getGeneratedOutputBySpecId(
      (await db.select().from(generatedOutputs).where(eq(generatedOutputs.id, id)))[0]?.specId || 0,
      userId
    );
    
    if (!output) {
      throw new Error("Generated output not found or access denied");
    }

    const [updated] = await db.update(generatedOutputs)
      .set({ engineeringTasks: tasks })
      .where(eq(generatedOutputs.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
