import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface UserState {
  userData: User | null;
  token: string | null;
  setUser: (userData: User | null) => void;
  setToken: (token: string | null) => void;
  setUserData: (userData: User | null, token: string | null) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userData: null,
      token: null,
      setUser: (userData) => set({ userData }),
      setToken: (token) => set({ token }),
      setUserData: (userData, token) => set({ userData, token }),
      clearUser: () => set({ userData: null, token: null }),
    }),
    {
      name: "user-storage",
    }
  )
);

export { useUserStore };
