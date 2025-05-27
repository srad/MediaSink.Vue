import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export enum ChannelsViewLayout {
  Grid = "grid",
  List = "list",
}

export type SettingsState = {
  videoVolume: number;
  videoMuted: boolean;
  layout: ChannelsViewLayout;
  filterViewPageSize: number;
  theme: "dark" | "light";
};

// -------------------------------------------------------------------
// Settings setup store declaration.
// All this acrobatics is only necessary because Pinia does not
// have its typesystem under control. Using the options store
// declaration leads to TS compiler errors.
// -------------------------------------------------------------------

export const useSettingsStore = defineStore("settings", () => {
  // Helper function to get the entire state from localStorage or return default values
  const loadStateFromLocalStorage = (): SettingsState => {
    const storedState = localStorage.getItem("settingsState");
    if (storedState !== null) {
      return JSON.parse(storedState); // Parse the stored JSON object
    }
    return {
      videoVolume: 1.0,
      videoMuted: true,
      layout: ChannelsViewLayout.Grid,
      filterViewPageSize: 100,
      theme: "light",
    }; // Default state if nothing is in localStorage
  };

  // Helper function to save the entire state to localStorage
  const saveStateToLocalStorage = (state: any) => {
    localStorage.setItem("settingsState", JSON.stringify(state)); // Save state as a JSON string
  };

  // Load the state from localStorage (or use default values)
  const savedState = loadStateFromLocalStorage();

  // Individual state variables stored in refs
  const videoVolume = ref(savedState.videoVolume);
  const videoMuted = ref(savedState.videoMuted);
  const layout = ref(savedState.layout);
  const filterViewPageSize = ref(savedState.filterViewPageSize);
  const theme = ref(savedState.theme);

  // Watch for changes to the state and save to localStorage
  watch(
    [videoVolume, videoMuted, layout, filterViewPageSize, theme],
    () => {
      const newState = {
        videoVolume: videoVolume.value,
        videoMuted: videoMuted.value,
        layout: layout.value,
        filterViewPageSize: filterViewPageSize.value,
        theme: theme.value,
      };
      saveStateToLocalStorage(newState); // Save the entire state back to localStorage
    },
    { deep: true },
  );

  // Actions
  const mute = () => {
    videoMuted.value = true;
  };

  const unmute = () => {
    videoMuted.value = false;
  };

  const updateVolume = (volume: number) => {
    if (volume < 0) {
      volume = 0;
    }
    if (volume > 1) {
      volume = 1;
    }
    videoVolume.value = volume;
  };

  const setChannelsLayout = (newLayout: ChannelsViewLayout) => {
    layout.value = newLayout;
  };

  const setFilterViewPageSize = (size: number) => {
    filterViewPageSize.value = size;
  };

  const updateTheme = (newTheme: "light" | "dark") => {
    theme.value = newTheme;
  };

  // Getters to access state variables
  const isMuted = computed(() => videoMuted.value);
  const isDarkMode = computed(() => theme.value === "dark");
  const isLightMode = computed(() => theme.value === "light");
  const currentVolume = computed(() => videoVolume.value);
  const isChannelsGridLayout = computed(() => layout.value === ChannelsViewLayout.Grid);
  const isChannelsListLayout = computed(() => layout.value === ChannelsViewLayout.List);
  const filterPageSize = computed(() => filterViewPageSize.value);

  return {
    videoVolume,
    videoMuted,
    layout,
    filterViewPageSize,
    theme,
    mute,
    unmute,
    updateVolume,
    setChannelsLayout,
    setFilterViewPageSize,
    updateTheme,
    isMuted,
    isDarkMode,
    isLightMode,
    currentVolume,
    isChannelsGridLayout,
    isChannelsListLayout,
    filterPageSize,
  };
});
