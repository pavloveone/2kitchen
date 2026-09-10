import { create } from 'zustand';

type ToastSeverity = 'error' | 'success' | 'info';

interface ToastState {
  message: string | null;
  severity: ToastSeverity;
  showToast: (message: string, severity?: ToastSeverity) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  severity: 'error',
  showToast: (message, severity = 'error') => set({ message, severity }),
  hideToast: () => set({ message: null }),
}));
