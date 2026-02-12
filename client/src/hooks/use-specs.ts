import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateSpecInput, type UpdateTasksInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

// GET /api/specs - List all specs
export function useSpecs() {
  return useQuery({
    queryKey: [api.specs.list.path],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.specs.list.path, { 
        headers,
        credentials: "include" 
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch specs");
      }
      return api.specs.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/specs/:id - Get single spec details
export function useSpec(id: number) {
  return useQuery({
    queryKey: [api.specs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.specs.get.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, { 
        headers,
        credentials: "include" 
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch spec");
      }
      return api.specs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/specs - Create new spec
export function useCreateSpec() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: CreateSpecInput) => {
      const validated = api.specs.create.input.parse(data);
      const headers = await getAuthHeaders();
      const res = await fetch(api.specs.create.path, {
        method: api.specs.create.method,
        headers,
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.specs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create spec");
      }
      return api.specs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.specs.list.path] });
      toast({
        title: "Success",
        description: "Spec created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// POST /api/specs/:id/generate - Generate AI content
export function useGenerateContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.specs.generate.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.specs.generate.method,
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Spec not found");
        throw new Error("Failed to generate content");
      }
      return api.specs.generate.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.specs.get.path, id] });
      toast({
        title: "Generation Complete",
        description: "User stories and tasks have been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// PATCH /api/specs/:id/tasks - Update task order/content
export function useUpdateTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: UpdateTasksInput }) => {
      const url = buildUrl(api.specs.updateTasks.path, { id });
      const headers = await getAuthHeaders();
      const res = await fetch(url, {
        method: api.specs.updateTasks.method,
        headers,
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update tasks");
      return api.specs.updateTasks.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.specs.get.path, id] });
      // Silent success usually preferred for drag-drop
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// GET /api/status - System health
export function useStatus() {
  return useQuery({
    queryKey: [api.status.get.path],
    queryFn: async () => {
      const res = await fetch(api.status.get.path);
      if (!res.ok) throw new Error("Failed to fetch status");
      return api.status.get.responses[200].parse(await res.json());
    },
    refetchInterval: 30000,
  });
}
