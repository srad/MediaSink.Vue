<template>
  <span class="hidden"></span>
</template>
<script setup lang="ts">
import { watch } from "vue";
// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  show: boolean;
  text: string;
}>();

// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(
  () => props.show,
  (val) => {
    if (val === true) {
      if (window.confirm(props.text)) {
        emit("confirm");
      } else {
        emit("cancel");
      }
    }
  },
);
</script>
