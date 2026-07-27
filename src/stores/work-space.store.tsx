import { create } from "zustand";

type State = { open: boolean };

type Actions = {
  setOpen: (open: boolean) => void;
  saveAction: (() => void) | null;
  registerSaveAction: (action: () => void) => void;
  unregisterSaveAction: () => void;
  handleClick: () => void;
};

type Store = State & Actions;

export const useStoreButtonHeader = create<Store>()((set, get) => ({
  open: false,
  setOpen: (open) => set(() => ({ open })),
  saveAction: null,
  registerSaveAction: (action) => set({ open: true, saveAction: action }),
  unregisterSaveAction: () => set({ open: false, saveAction: null }),
  handleClick: () => {
    const { saveAction } = get();
    if (saveAction) {
      saveAction();
    }
  },
}));
