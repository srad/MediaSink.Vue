<template>
  <ul class="list-group list-group-flush border-top border-secondary">
    <li class="list-group-item d-flex justify-content-between">
      <span>Length:</span> <span>{{ (duration / 60).toFixed(1) }}min</span>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span>Size:</span> <span>{{ (size / 1000 / 1000 / 1000).toFixed(1) }}GB</span>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span>Bitrate:</span> <span>{{ (bitRate / 1000 / 1000).toFixed(1) }}MBit/s</span>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span>Resolution:</span> <span>{{ width }}x{{ height }}</span>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span>Started:</span>
      <span>{{
          new Date(createdAt).toLocaleDateString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Berlin"
          })
        }}</span>
    </li>
    <li class="list-group-item bg-light">
      <div class="justify-content-between d-flex">
        <div>
          <i class="bi bi-download text-dark fs-5 me-3" :href="url + '/download'"></i>
          <i class="bi bi-heart-fill text-danger fs-5" @click="$emit('bookmarked', data, false)" v-if="bookmark"></i>
          <i v-else class="bi bi-heart text-danger fs-5" @click="$emit('bookmarked', data, true)"></i>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary me-2" @click="$emit('preview')">
            <i class="bi bi-film"></i>
          </button>
          <button class="btn btn-sm btn-danger" @click="$emit('destroy', data)">Delete</button>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//import { RecordingResponse } from '@/services/api/v1/recordingApi';

export default defineComponent({
  name: 'RecordInfo',
  props: {
    index: Number,
    url: String,
    bookmark: Boolean,
    data: Object,
    duration: Number,
    size: Number,
    bitRate: Number,
    width: Number,
    height: Number,
    createdAt: String,
  },
  methods: {}
});
</script>

<style scoped>

</style>
