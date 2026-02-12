import { z } from 'zod';
import { insertSpecSchema, insertGeneratedOutputSchema, specs, generatedOutputs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  specs: {
    create: {
      method: 'POST' as const,
      path: '/api/specs' as const,
      input: insertSpecSchema,
      responses: {
        201: z.custom<typeof specs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/specs' as const,
      responses: {
        200: z.array(z.custom<typeof specs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/specs/:id' as const,
      responses: {
        200: z.custom<typeof specs.$inferSelect & { output?: typeof generatedOutputs.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/specs/:id/generate' as const,
      responses: {
        200: z.custom<typeof generatedOutputs.$inferSelect>(),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    updateTasks: {
      method: 'PATCH' as const,
      path: '/api/specs/:id/tasks' as const,
      input: z.object({
        tasks: z.array(z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          group: z.string(),
        })),
      }),
      responses: {
        200: z.custom<typeof generatedOutputs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status' as const,
      responses: {
        200: z.object({
          backend: z.boolean(),
          database: z.boolean(),
          llm: z.boolean(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CreateSpecInput = z.infer<typeof api.specs.create.input>;
export type UpdateTasksInput = z.infer<typeof api.specs.updateTasks.input>;
export type SpecResponse = z.infer<typeof api.specs.get.responses[200]>;
export type StatusResponse = z.infer<typeof api.specs.list.responses[200]>;
