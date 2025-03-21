//@ts-nocheck https://github.com/prazdevs/pinia-plugin-persistedstate/issues/373
import { defineStore } from "pinia";
import AuthService from "../services/auth.service";
import type { RequestsAuthenticationRequest } from "../services/api/v1/StreamSinkClient.ts";

// --------------------------------------------------------------------------------------
// The useAuthStore(). and arrow syntax is only for the TS type deduction, otherwise
// it leads to compiler errors.
// --------------------------------------------------------------------------------------

const useAuthStore = defineStore("auth", {
  persist: true,
  state: (): AuthState => ({
    loggedIn: localStorage.getItem("authenticated") === "1",
    token: localStorage.getItem("jwt"),
  }),
  actions: {
    login: async (user: RequestsAuthenticationRequest) => {
      const token = await AuthService.login(user);
      useAuthStore.token = token;
      useAuthStore.loggedIn = true;
      localStorage.setItem("jwt", token);
      localStorage.setItem("authenticated", "1");
    },
    logout: () => {
      useAuthStore.token = null;
      useAuthStore.loggedIn = false;
      localStorage.removeItem("jwt");
      localStorage.removeItem("authenticated");
    },
    register: async (user: RequestsAuthenticationRequest) => {
      await AuthService.signup(user);
    }
  },
  getters: {
    isLoggedIn: (state: AuthState) => localStorage.getItem("authenticated") === "1",
    getToken: (state: AuthState): string | null => localStorage.getItem("jwt"),
  }
});

export { useAuthStore };
