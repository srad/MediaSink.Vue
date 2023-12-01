<template>
  <div class="text-white d-flex justify-content-between align-middle me-3 d-none d-lg-flex">
          <span class="fw-bold me-2 ">
            {{ pcent }}
            <i class="bi bi-hdd"></i>
          </span>
    <span class="progress m-1" style="min-width: 120px">
            <span class="progress-bar bg-info progress-bar-striped"
                  role="progressbar"
                  :style="{width: pcent}"
                  :aria-valuenow="parseInt(pcent)"
                  aria-valuemin="0"
                  aria-valuemax="100">
            </span>
          </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DiskStatus',
  props: {
    pcent: { type: String, required: true }
  }
});
</script>

<style scoped>

</style>
