import { create } from 'zustand';

interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

interface UIState {
  modals: Record<string, Modal>;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  modals: {},

  openModal: (id, data) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { id, isOpen: true, data },
      },
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], isOpen: false },
      },
    })),

  isModalOpen: (id) => {
    const modals = get().modals;
    return modals[id]?.isOpen || false;
  },
}));
