import { useMutation, useQuery } from "@tanstack/react-query";
import type { SetStateAction } from "react";
import { supabaseClient } from "./http.client";
import type { Employee } from "./employee.api";
import { queryClient } from "@/lib/query-client";

export type Schedule = {
  id: number;
  title: string;
  color: string;
  start_datetime: string;
  end_datetime: string;
  note: string;
  is_all_day: boolean;
  employees: Employee[];
};

const schedulesQueryKey = ["schedules"] as const;

const fetchSchedulesFromDb = async (): Promise<Schedule[]> => {
  const { data, error } = await supabaseClient.from("schedules").select(`
      *,
      employees (*)
    `);

  if (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }

  console.log("data", data);
  return (data as Schedule[]) ?? [];
};

const fetchOneScheduleFromDb = async (id: string): Promise<Schedule> => {
  const { data, error } = await supabaseClient
    .from("schedules")
    .select(
      `
        *,
        employees (*)
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error finding schedule ${id}:`, error);
    throw error;
  }

  return data as Schedule;
};

export const useSchedulesQuery = () => {
  return useQuery({
    queryKey: schedulesQueryKey,
    queryFn: fetchSchedulesFromDb,
  });
};

export const useScheduleQuery = (id?: string) => {
  return useQuery({
    queryKey: [...schedulesQueryKey, id],
    queryFn: async () => {
      if (!id) return null;
      return fetchOneScheduleFromDb(id);
    },
  });
};

export const useDeleteSchedule = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseClient
        .from("schedules")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting schedule ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: async (id) => {
      queryClient.setQueryData<Schedule[]>(schedulesQueryKey, (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: schedulesQueryKey });
    },
  });
};

export const useInsertSchedule = () => {
  return useMutation({
    mutationFn: async (newSchedule: Omit<Schedule, "id" | "employees">) => {
      const { data, error } = await supabaseClient
        .from("schedules")
        .insert([newSchedule])
        .select();

      if (error) {
        console.error("Error inserting schedule:", error);
        throw error;
      }

      return (data as Schedule[]) ?? [];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: schedulesQueryKey });
    },
  });
};

export const useUpdateSchedule = () => {
  return useMutation({
    mutationFn: async ({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: Partial<Omit<Schedule, "id" | "employees">>;
    }) => {
      const { data, error } = await supabaseClient
        .from("schedules")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) {
        console.error(`Error updating schedule ${id}:`, error);
        throw error;
      }

      return (data as Schedule[]) ?? [];
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Schedule[]>(schedulesQueryKey, (prev = []) =>
        prev.map((item) =>
          item.id === variables.id
            ? { ...item, ...variables.updatedFields }
            : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: schedulesQueryKey });
    },
  });
};

export const setSchedules = (value: SetStateAction<Schedule[]>) => {
  queryClient.setQueryData<Schedule[]>(schedulesQueryKey, (prev = []) =>
    typeof value === "function"
      ? (value(prev) as Schedule[])
      : (value as Schedule[]),
  );
};
