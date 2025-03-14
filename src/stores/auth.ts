//@ts-nocheck https://github.com/prazdevs/pinia-plugin-persistedstate/issues/373
import { defineStore } from "pinia";
import type { AuthState } from "../types/appTypes.ts";
import AuthService from "../services/auth.service";
import type { RequestsAuthenticationRequest } from "../services/api/v1/StreamSinkClient.ts";

// --------------------------------------------------------------------------------------
// The useAuthStore(). and arrow syntax is only for the TS type deduction, otherwise
// it leads to compiler errors.
// --------------------------------------------------------------------------------------

const useAuthStore = defineStore("auth", {
  persist: true,
  state: (): AuthState => ({
    loggedIn: false,
    token: null,
  }),
  actions: {
    login: async (user: RequestsAuthenticationRequest) => {
      const token = await AuthService.login(user);
      useAuthStore.token = token;
      useAuthStore.loggedIn = true;
    },
    logout: () => {
      useAuthStore.token = null;
      useAuthStore.loggedIn = false;
      useAuthStore.$patch({ token: null, loggedIn: false }); // force update, sometimes does not update values.
    },
    register: async (user: RequestsAuthenticationRequest) => {
      await AuthService.signup(user);
    }
  },
  getters: {
    isLoggedIn: (state: AuthState) => state.loggedIn,
    getToken: (state: AuthState): string | null | undefined => state.token,
  }
});

export { useAuthStore };
