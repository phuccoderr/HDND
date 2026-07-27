import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import { queryClient } from "@/lib/query-client";

export type Absence = {
  id: number;
  employee_id: number;
  start_datetime: string;
  end_datetime: string;
  note: string;
};

const absencesQueryKey = ["absences"] as const;

export const useAbsencesQuery = () => {
  return useQuery({
    queryKey: absencesQueryKey,
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("absences").select();

      if (error) {
        console.error("Error fetching absences:", error);
        throw error;
      }

      return (data as Absence[]) ?? [];
    },
  });
};

export const useAbsenceQuery = (id?: number) => {
  return useQuery({
    queryKey: [...absencesQueryKey, id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("absences")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error finding absence ${id}:`, error);
        throw error;
      }

      return data as Absence;
    },
    enabled: !!id,
  });
};

export const useInsertAbsence = () => {
  return useMutation({
    mutationFn: async (payload: Omit<Absence, "id">) => {
      const { data, error } = await supabaseClient
        .from("absences")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting absence:", error);
        throw error;
      }

      return data as Absence;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData<Absence[]>(absencesQueryKey, (prev = []) => [
        ...prev,
        data,
      ]);
      await queryClient.invalidateQueries({ queryKey: absencesQueryKey });
    },
  });
};

export const useUpdateAbsence = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Omit<Absence, "id">>;
    }) => {
      const { data, error } = await supabaseClient
        .from("absences")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating absence ${id}:`, error);
        throw error;
      }
      return data as Absence;
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Absence[]>(absencesQueryKey, (prev = []) =>
        prev.map((item) =>
          item.id === variables.id ? { ...item, ...variables.payload } : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: absencesQueryKey });
    },
  });
};

export const useDeleteAbsence = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseClient
        .from("absences")
        .delete()
        .eq("id", id);
      if (error) {
        console.error(`Error deleting absence ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: async (id) => {
      queryClient.setQueryData<Absence[]>(absencesQueryKey, (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: absencesQueryKey });
    },
  });
};

export const setAbsences = (
  value: Absence[] | ((prev: Absence[]) => Absence[]),
) => {
  queryClient.setQueryData<Absence[]>(absencesQueryKey, (prev = []) => {
    if (typeof value === "function") {
      return value(prev);
    }

    return value;
  });
};
