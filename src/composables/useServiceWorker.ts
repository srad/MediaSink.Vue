import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";

export function useServiceWorker() {
  const updateAvailable = ref(false);

  const updateSW = registerSW({
    onRegisteredSW() {
      console.log("Update service worker registered");
    },
    onNeedRefresh() {
      updateAvailable.value = true;
    },
    onOfflineReady() {
      console.log("App is ready for offline usage.");
    },
  });

  return { updateAvailable, updateSW };
}
