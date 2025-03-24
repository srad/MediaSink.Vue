<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div :id="`toast_${toast.id}`" v-for="toast in toasts" :key="toast.id" class="toast show rounded-2 border-1 bg-info shadow-sm border-dark" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header rounded-top-2" :class="toastHeaderClass[toast.kind]">
        <strong class="me-auto">{{ toast.title }}</strong>
        <button type="button" class="btn-close" @click="emit('destroy', toast);" aria-label="Close"></button>
      </div>
      <div class="toast-body bg-secondary-subtle text-dark rounded-bottom-2">
        <div>
          {{ toast.message }}
        </div>
        <div style="height: 3px" :style="{ width: toast.countdown + '%' }" class="mt-2 line-indicator" :class="toastLineClass[toast.kind]"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Toast, ToastKind } from "../stores/toast";
import { computed } from "vue";

// --------------------------------------------------------------------------------------
// Emit
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: "destroy", value: Toast): void }>();

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{ toasts: Toast[] }>();

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const toasts = computed(() => props.toasts.filter(toast => !toast.hide));

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const toastLineClass: { [key in ToastKind]: string } = {
  [ToastKind.Info]: "bg-info",
  [ToastKind.Warning]: "bg-warning",
  [ToastKind.Error]: "bg-danger",
  [ToastKind.Success]: "bg-success",
};

const toastHeaderClass: { [key in ToastKind]: string } = {
  [ToastKind.Info]: "bg-info-subtle",
  [ToastKind.Warning]: "bg-warning-subtle",
  [ToastKind.Error]: "bg-danger-subtle",
  [ToastKind.Success]: "bg-success-subtle",
};
</script>
