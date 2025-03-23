import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../../src/stores/auth";
import AuthService from "../../src/services/auth.service";

// Mock AuthService
vi.mock("@/services/auth.service", () => ({
  default: {
    login: vi.fn(async () => "mocked-jwt-token"),
    signup: vi.fn(async () => {}),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset Pinia before each test
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("should initialize with correct default values", () => {
    const authStore = useAuthStore();
    expect(authStore.loggedIn).toBe(false);
    expect(authStore.token).toBeNull();
  });

  it("should log in and update state correctly", async () => {
    const authStore = useAuthStore();
    await authStore.login({ username: "test", password: "1234" });

    expect(authStore.token).toBe("mocked-jwt-token");
    expect(authStore.loggedIn).toBe(true);
    expect(localStorage.getItem("jwt")).toBe("mocked-jwt-token");
    expect(localStorage.getItem("authenticated")).toBe("1");
  });

  it("should log out and reset state", () => {
    const authStore = useAuthStore();
    authStore.token = "some-token"; // Simulate logged-in state
    authStore.loggedIn = true;

    authStore.logout();

    expect(authStore.token).toBeNull();
    expect(authStore.loggedIn).toBe(false);
    expect(localStorage.getItem("jwt")).toBeNull();
    expect(localStorage.getItem("authenticated")).toBeNull();
  });

  it("should call register action without errors", async () => {
    const authStore = useAuthStore();
    await authStore.register({ username: "test", password: "1234" });

    expect(AuthService.signup).toHaveBeenCalledOnce();
  });

  it("should return correct values from getters", async () => {
    const authStore = useAuthStore();
    await authStore.login({ username: "test", password: "1234" });

    expect(authStore.isLoggedIn).toBe(true);
    expect(authStore.getToken).toBe("mocked-jwt-token");
  });
});
