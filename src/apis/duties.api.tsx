import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import { queryClient } from "@/lib/query-client";

export type Duty = {
  id: number;
  employee_id: number;
  start_time: string;
  end_time: string;
};

const dutiesQueryKey = ["duties"] as const;

export const useDutiesQuery = () => {
  return useQuery({
    queryKey: dutiesQueryKey,
    queryFn: async (): Promise<Duty[]> => {
      const { data, error } = await supabaseClient.from("duties").select();

      if (error) {
        console.error("Error fetching duties:", error);
        throw error;
      }

      return data as Duty[];
    },
  });
};

export const useDutyQuery = (id?: number) => {
  return useQuery({
    queryKey: [...dutiesQueryKey, id],
    queryFn: async (): Promise<Duty> => {
      const { data, error } = await supabaseClient
        .from("duties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error finding duty ${id}:`, error);
        throw error;
      }

      return data as Duty;
    },
    enabled: !!id,
  });
};

export const useInsertDuty = () => {
  return useMutation({
    mutationFn: async (payload: Omit<Duty, "id">) => {
      const { data, error } = await supabaseClient
        .from("duties")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting duty:", error);
        throw error;
      }

      return data as Duty;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData<Duty[]>(dutiesQueryKey, (prev = []) => [
        ...prev,
        data,
      ]);
      await queryClient.invalidateQueries({ queryKey: dutiesQueryKey });
    },
  });
};

export const useUpdateDuty = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Duty, "id">>;
    }) => {
      const { data, error } = await supabaseClient
        .from("duties")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating duty ${id}:`, error);
        throw error;
      }

      return data as Duty;
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Duty[]>(dutiesQueryKey, (prev = []) =>
        prev.map((item) =>
          item.id === variables.id ? { ...item, ...variables.payload } : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: dutiesQueryKey });
    },
  });
};

export const useDeleteDuty = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseClient
        .from("duties")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting duty ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: async (id) => {
      queryClient.setQueryData<Duty[]>(dutiesQueryKey, (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: dutiesQueryKey });
    },
  });
};
