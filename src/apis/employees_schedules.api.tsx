import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import type { Employee } from "./employee.api";
import { queryClient } from "@/lib/query-client";

type EmployeeScheduleJunction = {
  schedule_id: number;
  employee_id: number;
};

export const employeesByScheduleQueryKey = (scheduleId: number) =>
  ["employees-schedules", scheduleId] as const;

export const fetchEmployeesByScheduleFromDb = async (
  scheduleId: number,
): Promise<Employee[]> => {
  const { data, error } = await supabaseClient
    .from("employees_schedules")
    .select(`employees (*)`)
    .eq("schedule_id", scheduleId);

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  return (data ?? [])
    .map((item) => item.employees as unknown as Employee | null)
    .filter((employee): employee is Employee => Boolean(employee));
};

export const useEmployeesByScheduleQuery = (scheduleId: number) => {
  return useQuery({
    queryKey: employeesByScheduleQueryKey(scheduleId),
    queryFn: () => fetchEmployeesByScheduleFromDb(scheduleId),
    enabled: !!scheduleId,
  });
};

export const useInsertScheduleToEmployees = () => {
  return useMutation({
    mutationFn: async (junctionData: EmployeeScheduleJunction[]) => {
      if (junctionData.length === 0) {
        return [] as EmployeeScheduleJunction[];
      }

      const { data, error } = await supabaseClient
        .from("employees_schedules")
        .insert(junctionData);

      if (error) {
        console.error("Error inserting schedule_employee:", error);
        throw error;
      }

      return (data as unknown as EmployeeScheduleJunction[]) ?? [];
    },
    onSuccess: async (_data, junctionData) => {
      const scheduleIds = [
        ...new Set(junctionData.map((item) => item.schedule_id)),
      ];
      await Promise.all(
        scheduleIds.map((scheduleId) =>
          queryClient.invalidateQueries({
            queryKey: employeesByScheduleQueryKey(scheduleId),
          }),
        ),
      );
    },
  });
};

export const useUpdateEmployeesBySchedule = () => {
  return useMutation({
    mutationFn: async ({
      scheduleId,
      newJunctionData,
    }: {
      scheduleId: number;
      newJunctionData: EmployeeScheduleJunction[];
    }) => {
      const { error: deleteError } = await supabaseClient
        .from("employees_schedules")
        .delete()
        .eq("schedule_id", scheduleId);

      if (deleteError) {
        console.error("Error deleting old schedules:", deleteError);
        throw deleteError;
      }

      if (newJunctionData.length === 0) {
        return [] as EmployeeScheduleJunction[];
      }

      const { data, error: insertError } = await supabaseClient
        .from("employees_schedules")
        .insert(newJunctionData);

      if (insertError) {
        console.error(
          "Error inserting new schedules during update:",
          insertError,
        );
        throw insertError;
      }

      return (data as unknown as EmployeeScheduleJunction[]) ?? [];
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: employeesByScheduleQueryKey(variables.scheduleId),
      });
    },
  });
};
