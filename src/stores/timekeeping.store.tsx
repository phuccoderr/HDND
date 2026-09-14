import type { Schedule } from "@/apis/schedules.api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = { schedules: Schedule[] };

type Actions = {
  setSchedules: (schedules: Schedule[]) => void;
};

type Store = State & Actions;

export const useTimekeepingStore = create<Store>()(
  persist(
    (set) => ({
      schedules: [],
      setSchedules: (schedules: Schedule[]) => set({ schedules }),
    }),
    {
      name: "schedules_data",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            // Khi đọc lên, ta bọc lại thành cấu trúc mà Zustand persist mong đợi
            const schedules = JSON.parse(str);
            return { state: { schedules } };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          // Khi lưu xuống, chỉ trích xuất đúng mảng schedules để lưu
          localStorage.setItem(name, JSON.stringify(value.state.schedules));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
