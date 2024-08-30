<template>
  <div v-if="props.busy || props.empty" class="d-flex justify-content-center">
    <div v-if="props.busy" class="text-center">
      <div class="spinner-border text-primary" role="status" :style="size">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <h3 v-if="props.empty && !props.busy" class="text-dark">
      {{ props.emptyText }}
    </h3>
  </div>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

const props = defineProps<{
  busy: boolean
  empty?: boolean
  emptyText: string
  size?: 'default' | 'sm'
}>();

const styles = {
  default: 'width: 3rem; height: 3rem',
  sm: 'width: 1.5rem; height: 1.5rem',
};

const size = computed(() => props.size ? styles[props.size] : styles.default);
</script>

<style scoped>

</style>
