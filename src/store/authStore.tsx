import { create } from "zustand";

type AuthState = {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: localStorage.getItem("user") || null,
    login: (username) => {
        localStorage.setItem("user", username);
        set({ user: username });
    },
    logout: () => {
        localStorage.removeItem("user");
        set({ user: null });
    },
}));
