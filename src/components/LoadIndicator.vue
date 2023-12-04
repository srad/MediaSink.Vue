<template>
  <div v-if="busy || empty" class="d-flex justify-content-center">
    <div v-if="busy" class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <h3 v-if="empty && !busy" class="text-dark">
      {{ emptyText }}
    </h3>
  </div>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "LoadIndicator",
  props: {
    busy: {type: Boolean, required: true},
    empty: {type: Boolean, default: true},
    emptyText: {type: String, default: ""}
  }
});
</script>

<style scoped>

</style>
