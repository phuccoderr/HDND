import { useMutation, useQuery } from "@tanstack/react-query";
import { supabaseClient } from "./http.client";
import { queryClient } from "@/lib/query-client";
import type { Employee } from "./employee.api";

export type CleanRoom = {
  id: number;
  date: string;
  room1_employee_id: number;
  room3_employee_id: number;
  toilet_employee_id: number;
  room1_employee: Employee | null;
  room3_employee: Employee | null;
  toilet_employee: Employee | null;
};

const cleanRoomQueryKey = "CLEAN_ROOMS" as const;

// export const useCleanRoomsQuery = () => {
//   return useQuery({
//     queryKey: [cleanRoomQueryKey],
//     queryFn: async (): Promise<CleanRoom[]> => {
//       const { data, error } = await supabaseClient.from("clean_room").select();

//       if (error) {
//         console.error("Error fetching clean room:", error);
//         throw error;
//       }

//       return data as CleanRoom[];
//     },
//   });
// };

export const useCleanRoomQuery = (id?: number) => {
  return useQuery({
    queryKey: [cleanRoomQueryKey, id],
    queryFn: async (): Promise<CleanRoom> => {
      const { data, error } = await supabaseClient
        .from("clean_room")
        .select(
          `
      *,
      room1_employee:employees!clean_room1_employee_id_fkey(*),
      room3_employee:employees!clean_room1_next_employee_id_fkey(*),
      toilet_employee:employees!clean_room_toilet_employee_id_fkey(*)
    `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error finding clean rooms ${id}:`, error);
        throw error;
      }

      return data as CleanRoom;
    },
    enabled: !!id,
  });
};

// export const useInsertDuty = () => {
//   return useMutation({
//     mutationFn: async (payload: Omit<Duty, "id" | "employee">) => {
//       const { data, error } = await supabaseClient
//         .from("duties")
//         .insert(payload)
//         .select()
//         .single();

//       if (error) {
//         console.error("Error inserting duty:", error);
//         throw error;
//       }

//       return data as Duty;
//     },
//     onSuccess: async (data) => {
//       queryClient.setQueryData<Duty[]>(dutiesQueryKey, (prev = []) => [
//         ...prev,
//         data,
//       ]);
//       await queryClient.invalidateQueries({ queryKey: dutiesQueryKey });
//     },
//   });
// };

export const useUpdateCleanRoom = () => {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<
        Omit<
          CleanRoom,
          "id" | "room1_employee" | "room3_employee" | "toilet_employee"
        >
      >;
    }) => {
      const { data, error } = await supabaseClient
        .from("clean_room")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating clean room ${id}:`, error);
        throw error;
      }

      return data as CleanRoom;
    },
    onSuccess: async (_data, variables) => {
      queryClient.setQueryData<CleanRoom[]>([cleanRoomQueryKey], (prev = []) =>
        prev.map((item) =>
          item.id === variables.id ? { ...item, ...variables.payload } : item,
        ),
      );
      await queryClient.invalidateQueries({ queryKey: [cleanRoomQueryKey] });
      await queryClient.refetchQueries({ queryKey: [cleanRoomQueryKey, 1] });
    },
  });
};

// export const useDeleteDuty = () => {
//   return useMutation({
//     mutationFn: async (id: number) => {
//       const { error } = await supabaseClient
//         .from("duties")
//         .delete()
//         .eq("id", id);

//       if (error) {
//         console.error(`Error deleting duty ${id}:`, error);
//         throw error;
//       }

//       return id;
//     },
//     onSuccess: async (id) => {
//       queryClient.setQueryData<Duty[]>(dutiesQueryKey, (prev = []) =>
//         prev.filter((item) => item.id !== id),
//       );
//       await queryClient.invalidateQueries({ queryKey: dutiesQueryKey });
//     },
//   });
// };
