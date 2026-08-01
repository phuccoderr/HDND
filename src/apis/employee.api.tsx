import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import { queryClient } from "@/lib/query-client";

export type Employee = {
  id: number;
  full_name: string;
  type: "EMPLOYEE" | "COMMAND" | "DUTY";
  room: "ROOM1" | "ROOM3";
  order: number;
  color: string;
};

const employeesQueryKey = ["employees"] as const;

export const useEmployeesQuery = () => {
  return useQuery({
    queryKey: employeesQueryKey,
    queryFn: async () => {
      const { data, error } = await supabaseClient.from("employees").select();

      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }

      return (data as Employee[]) ?? [];
    },
  });
};

export const useEmployeeQuery = (id?: number) => {
  return useQuery({
    queryKey: [...employeesQueryKey, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabaseClient
        .from("employees")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error finding employee ${id}:`, error);
        throw error;
      }

      return data as Employee;
    },
    enabled: !!id,
  });
};

export const useDeleteEmployee = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabaseClient
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting employee ${id}:`, error);
        throw error;
      }

      return id;
    },
    onSuccess: async (id) => {
      queryClient.setQueryData<Employee[]>(employeesQueryKey, (prev = []) =>
        prev.filter((item) => item.id !== id),
      );
      await queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
};

export const useInsertEmployee = () => {
  return useMutation({
    mutationFn: async (newEmployee: Omit<Employee, "id">) => {
      const { data, error } = await supabaseClient
        .from("employees")
        .insert(newEmployee)
        .select()
        .single();

      if (error) {
        console.error("Error inserting employee:", error);
        throw error;
      }

      return data as Employee;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData<Employee[]>(employeesQueryKey, (prev = []) => [
        ...prev,
        data,
      ]);
      await queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
};

export const useUpdateEmployee = () => {
  return useMutation({
    mutationFn: async ({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: Partial<Omit<Employee, "id">>;
    }) => {
      const { data, error } = await supabaseClient
        .from("employees")
        .update(updatedFields)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating employee ${id}:`, error);
        throw error;
      }

      return data as Employee;
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<Employee[]>(employeesQueryKey, (prev = []) =>
        prev.map((item) =>
          item.id === variables.id
            ? { ...item, ...variables.updatedFields }
            : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
};

export const useUpdateEmployees = () => {
  return useMutation({
    mutationFn: async ({
      updatedEmployees,
    }: {
      updatedEmployees: (Partial<Employee> & { id: number })[];
    }) => {
      const { data, error } = await supabaseClient
        .from("employees")
        .upsert(updatedEmployees)
        .select();

      if (error) {
        console.error(`Error updating employees:`, error);
        throw error;
      }

      return data as Employee[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesQueryKey });
    },
  });
};

export const setEmployees = (
  value: Employee[] | ((prev: Employee[]) => Employee[]),
) => {
  queryClient.setQueryData<Employee[]>(employeesQueryKey, (prev = []) => {
    if (typeof value === "function") {
      return value(prev);
    }

    return value;
  });
};
