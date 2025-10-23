
import { create } from "zustand";

export type AppUser = {
  id: string;
  username?: string;
  name?: string;
  email: string;
  password?: string;
  role?: "user" | "admin";
  createdAt?: string;
};

type AuthState = {
  user: { id: string; username?: string; email: string; role?: "user" | "admin"; name?: string } | null;
  users: AppUser[];
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  register: (email: string, password: string, name?: string) => { success: boolean; message?: string };
  loadUsers: () => void;
  promoteToAdmin: (emailOrUsername: string) => void;
  deleteUser: (emailOrUsername: string) => void;
};

const USERS_KEY = "users";      
const AUTH_USER_KEY = "authUser";
const ROLE_KEY = "role";

const ADMIN_EMAIL = "admin123@gmail.com";
const ADMIN_PW = "admin123";

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const readUsersFromStorage = (): AppUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const defaultUsers: AppUser[] = [
        {
          id: makeId(),
          name: "Admin",
          email: ADMIN_EMAIL,
          password: ADMIN_PW,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw) as AppUser[];
  } catch (err) {
    console.error("authStore: failed to read users", err);
    return [];
  }
};

const readAuthUserFromStorage = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: readAuthUserFromStorage(),
  users: readUsersFromStorage(),

  loadUsers: () => {
    set({ users: readUsersFromStorage() });
  },

  login: (identifier, password) => {
    const users = readUsersFromStorage();
    const idLower = String(identifier || "").trim().toLowerCase();

    const found = users.find((u) => {
      const email = String(u.email || "").toLowerCase();
      const username = String(u.username || "").toLowerCase();
      return (email === idLower || username === idLower) && String(u.password) === String(password);
    });

    if (found) {
      const authUser = {
        id: found.id,
        username: found.username || found.email,
        email: found.email,
        role: found.role || "user",
        name: found.name,
      };
      try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        localStorage.setItem(ROLE_KEY, authUser.role || "user");
      } catch (err) {
        console.warn("authStore: cannot write authUser", err);
      }
      set({ user: authUser, users: users });
      return true;
    }

    return false;
  },

  logout: () => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {}
    set({ user: null });
  },

  register: (email, password, name = "") => {
    try {
      const users = readUsersFromStorage();
      const emailLower = String(email || "").trim().toLowerCase();
      if (users.some((u) => (u.email || "").toLowerCase() === emailLower || (u.username || "").toLowerCase() === emailLower)) {
        return { success: false, message: "Email đã tồn tại" };
      }
      const newUser: AppUser = {
        id: makeId(),
        name: name || emailLower.split("@")[0],
        email: emailLower,
        password,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      const updated = [...users, newUser];
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      set({ users: updated });
      return { success: true };
    } catch (err) {
      console.error("authStore.register error", err);
      return { success: false, message: "Lỗi khi tạo tài khoản" };
    }
  },

  promoteToAdmin: (emailOrUsername) => {
    try {
      const users = readUsersFromStorage();
      const key = String(emailOrUsername || "").toLowerCase();
      const updated = users.map((u) =>
        ((u.email || "").toLowerCase() === key || (u.username || "").toLowerCase() === key) ? { ...u, role: "admin" as const } : u
      );
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      set({ users: updated });
    } catch (err) {
      console.error("promoteToAdmin error", err);
    }
  },

  deleteUser: (emailOrUsername) => {
    try {
      const users = readUsersFromStorage();
      const key = String(emailOrUsername || "").toLowerCase();
      const updated = users.filter((u) => !(((u.email || "").toLowerCase() === key) || ((u.username || "").toLowerCase() === key)));
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      set({ users: updated });

      const current = get().user;
      if (current && ((current.email || "").toLowerCase() === key || (current.username || "").toLowerCase() === key)) {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(ROLE_KEY);
        set({ user: null });
      }
    } catch (err) {
      console.error("deleteUser error", err);
    }
  },
}));
