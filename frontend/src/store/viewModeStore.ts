import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ViewMode = 'list' | 'grid' | 'table';

interface ViewModeState {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  immer((set) => ({
    viewMode: 'grid',
    toggleViewMode: () =>
      set((state) => ({
        viewMode: state.viewMode === 'list' ? 'grid' : 'list',
      })),
    setViewMode: (mode) => set({ viewMode: mode }),
  })),
);
