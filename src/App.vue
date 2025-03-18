<template>
  <!-- Update Notification -->
  <div v-if="updateAvailable" class="update-notification align-items-center d-flex bg-warning shadow-sm p-3 rounded-2">
    <p>New update available!</p>
    <button type="button" class="btn btn-sm btn-primary" @click="refreshApp">Update Now</button>
  </div>

  <component :is="layoutComponent">
    <RouterView :key="$route.fullPath"/>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useRoute } from "vue-router";
import { useServiceWorker } from "./composables/useServiceWorker";
import FullscreenLayout from "@/layouts/FullscreenLayout.vue";

const route = useRoute();
const { updateAvailable, updateSW } = useServiceWorker();

const refreshApp = () => {
  updateSW(); // Reload the app and apply the new SW
};

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  fullscreen: FullscreenLayout
};

//@ts-expect-error nonsense
const layoutComponent = computed(() => layouts[route.meta.layout] || DefaultLayout);

</script>

<style lang="scss">
@import "./assets/main.scss";

.update-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: bold;
}
</style>
