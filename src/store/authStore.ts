import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AuthApi, LoginRequest, RegisterUserRequest, UserResponse, setAuthToken } from '../api';

const TOKEN_STORAGE_KEY = '2kitchen_access_token';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterUserRequest) => Promise<void>;
  logout: () => void;
  restoreSession: () => void;
}

const authApi = new AuthApi();

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    isAuthenticated: false,
    isReady: false,
    login: async (data) => {
      const { data: response } = await authApi.login(data);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      setAuthToken(response.access_token);
      set({ user: response.user, isAuthenticated: true });
    },
    register: async (data) => {
      await authApi.register(data);
    },
    logout: () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthToken(null);
      set({ user: null, isAuthenticated: false });
    },
    restoreSession: () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        setAuthToken(token);
        set({ isAuthenticated: true });
      }
      set({ isReady: true });
    },
  })),
);
