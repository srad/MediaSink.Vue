// --------------------------------------------------------
// Use of Setup Store Instead of Object Store declaration
// syntax here. For some bizarre reason Typescript is
// getting a seizure with the regular Pinia declaration..
// --------------------------------------------------------
import { defineStore } from "pinia";
import AuthService from "../services/auth.service";
import type { RequestsAuthenticationRequest } from "../services/api/v1/MediaSinkClient";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("jwt"));
  const loggedIn = ref<boolean>(localStorage.getItem("authenticated") === "1");

  const login = async (user: RequestsAuthenticationRequest) => {
    const newToken = await AuthService.login(user);
    token.value = newToken;
    loggedIn.value = true;
    localStorage.setItem("jwt", newToken);
    localStorage.setItem("authenticated", "1");
  };

  const logout = () => {
    token.value = null;
    loggedIn.value = false;
    localStorage.removeItem("jwt");
    localStorage.removeItem("authenticated");
  };

  const register = async (user: RequestsAuthenticationRequest) => {
    await AuthService.signup(user);
  };

  const isLoggedIn = computed(() => loggedIn.value);
  const getToken = computed(() => token.value);

  return {
    token,
    loggedIn,
    login,
    logout,
    register,
    isLoggedIn,
    getToken,
  };
});
