<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div v-for="toast in toasts" :key="toast.id" class="toast border-dark show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-info-light">
        <strong class="me-auto">{{ toast.title }}</strong>
        <button type="button" class="btn-close" @click="() => store.hide(toast)" aria-label="Close"></button>
      </div>
      <div class="toast-body bg-secondary-subtle text-dark">
        <div>
          {{ toast.message }}
        </div>
        <div style="height: 3px" :style="{ width: toast.countdown + '%' }" class="mt-2 line-indicator" :class="toastClass[toast.kind]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Toast, ToastKind, useToastStore } from "../stores/toast";
import { computed } from "vue";

const store = useToastStore();

const props = defineProps<{ toasts: Toast[] }>();

const toasts = computed(() => props.toasts.filter((x) => !x.hide));

const toastClass: { [key in ToastKind]: string } = {
  [ToastKind.Info]: "bg-info",
  [ToastKind.Warning]: "bg-warning",
  [ToastKind.Error]: "bg-danger",
  [ToastKind.Success]: "bg-success",
};
</script>
