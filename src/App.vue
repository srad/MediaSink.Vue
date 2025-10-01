<template>
  <component :is="layoutComponent">
    <RouterView :key="$route.fullPath.split('?')[0]" />
  </component>
  <div v-if="showUpdateBanner" class="update-notification">
    <p>A new version of the app is available!</p>
    <button @click="reloadApp">Reload</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useRoute } from "vue-router";
import FullscreenLayout from "@/layouts/FullscreenLayout.vue";

const route = useRoute();

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  fullscreen: FullscreenLayout,
};

//@ts-expect-error nonsense
const layoutComponent = computed(() => layouts[route.meta.layout] || DefaultLayout);

const showUpdateBanner = ref(false);

onMounted(() => {
  if ("serviceWorker" in navigator) {
    // Listen for a new service worker being installed
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // A new service worker has taken control
      showUpdateBanner.value = true;
    });
  }
});

const reloadApp = () => {
  // Post a message to the Service Worker to skip waiting and activate
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
  }

  // Reload the page to apply the new version
  window.location.reload();
};
</script>

<style lang="scss">
@import "./assets/main.scss";

.update-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  background-color: #333;
  color: white;
  border: 2px solid #ff5733;
  padding: 15px;
  border-radius: 5px;
  z-index: 1000;
  transform: translateX(-50%);
  min-width: 300px;
}

.update-notification button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff5733;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 3px;
}

.update-notification button:hover {
  background-color: #ff2e00;
}
</style>
