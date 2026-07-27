import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import { queryClient } from "@/lib/query-client";
import type { Employee } from "./employee.api";

export type Command = {
  id: number;
  employee_id: number;
  start_time: string;
  end_time: string;
  employee: Employee;
};

const commandsQueryKey = ["commands"] as const;

export const useCommandsQuery = () => {
  return useQuery({
    queryKey: commandsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("commands").select("*");
      if (error) {
        console.error("Error fetching commands:", error);
        throw error;
      }
      return data as Command[];
    },
  });
};

export const useCommandQuery = (id?: number) => {
  return useQuery({
    queryKey: [...commandsQueryKey, id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("commands")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error finding command ${id}:`, error);
        throw error;
      }

      return data as Command;
    },
    enabled: !!id,
  });
};

export const useInsertCommand = () => {
  return useMutation({
    mutationFn: async (payload: Omit<Command, "id" | "employee">) => {
      const { data, error } = await supabaseClient
        .from("commands")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting command:", error);
        throw error;
      }

      return data as Command;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData<Command[]>(commandsQueryKey, (prev = []) => [
        ...prev,
        data,
      ]);
      await queryClient.invalidateQueries({ queryKey: commandsQueryKey });
    },
  });
};

export const useUpdateCommand = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Command, "id" | "employee">>;
    }) => {
      const { data, error } = await supabaseClient
        .from("commands")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating employee ${id}:`, error);
        throw error;
      }

      return data as Command;
    },

    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Command[]>(commandsQueryKey, (prev = []) =>
        prev.map((item) =>
          item.id === variables.id ? { ...item, ...variables.payload } : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: commandsQueryKey });
    },
  });
};

export const useDeleteCommand = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseClient
        .from("commands")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting command ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: async (id) => {
      queryClient.setQueryData<Command[]>(commandsQueryKey, (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: commandsQueryKey });
    },
  });
};
