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
  is_updated: boolean;
  employee_ids?: number[];
};

export const schedulesQueryKey = "Schedules" as const;

type SchedulesQueryProps = {
  start_time?: string;
  end_time?: string;
};

export const useSchedulesQuery = (props: SchedulesQueryProps) => {
  return useQuery({
    queryKey: [schedulesQueryKey, props],
    queryFn: async () => {
      const { start_time, end_time } = props;

      let query = supabaseClient.from("schedules").select(`
      *,
      employees (*)
    `);

      if (start_time) {
        query = query.gte("start_datetime", start_time);
      }

      if (end_time) {
        query = query.lte("end_datetime", end_time);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }

      return (data as Schedule[]) ?? [];
    },
  });
};

export const useScheduleQuery = (id?: string) => {
  return useQuery({
    queryKey: [schedulesQueryKey, id],
    queryFn: async () => {
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
    },
    enabled: !!id,
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
      queryClient.setQueryData<Schedule[]>([schedulesQueryKey], (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: [schedulesQueryKey] });
    },
  });
};

export const useInsertSchedule = () => {
  return useMutation({
    mutationFn: async (newSchedule: Omit<Schedule, "id" | "employees">) => {
      const { data, error } = await supabaseClient
        .from("schedules")
        .insert(newSchedule)
        .select()
        .single();

      if (error) {
        console.error("Error inserting schedule:", error);
        throw error;
      }

      return data as Schedule;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [schedulesQueryKey] });
    },
  });
};

export const useInsertSchedules = () => {
  return useMutation({
    mutationFn: async (
      newSchedules: Pick<
        Schedule,
        | "title"
        | "color"
        | "end_datetime"
        | "start_datetime"
        | "is_all_day"
        | "is_updated"
        | "note"
      >[],
    ) => {
      const { data, error } = await supabaseClient
        .from("schedules")
        .insert(newSchedules)
        .select();

      if (error) {
        console.error("Error inserting schedule:", error);
        throw error;
      }

      return data as Schedule[];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [schedulesQueryKey] });
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
      queryClient.setQueryData<Schedule[]>([schedulesQueryKey], (prev = []) =>
        prev.map((item) =>
          item.id === variables.id
            ? { ...item, ...variables.updatedFields }
            : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: [schedulesQueryKey] });
    },
  });
};

export const setSchedules = (value: SetStateAction<Schedule[]>) => {
  queryClient.setQueryData<Schedule[]>([schedulesQueryKey], (prev = []) =>
    typeof value === "function"
      ? (value(prev) as Schedule[])
      : (value as Schedule[]),
  );
};
