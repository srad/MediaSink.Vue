<template>
  <button type="button" class="d-flex position-relative me-2 btn btn-info" @click="emit('click')">
    <span class="me-2">{{ props.totalCount }}</span> <span class="me-2">{{ t("menu.jobs") }}</span>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ totalCount: number }>();
const emit = defineEmits<{ (e: "click"): void }>();
</script>
