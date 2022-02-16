<template>
  <ul class="list-group list-group-flush border-top border-secondary">
    <li class="list-group-item d-flex justify-content-center">
      <span>
        <i class="bi bi-watch"></i>
        {{ durationFormatted }}min
      </span>
      <span class="text-secondary px-2">/</span>
      <span>
        <i class="bi bi-device-hdd"></i>
        {{ (size / 1000 / 1000 / 1000).toFixed(1) }}GB
      </span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>Bitrate:</span> <span>{{ (bitRate / 1000 / 1000).toFixed(1) }}MBit/s</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>Resolution:</span> <span>{{ width }}x{{ height }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>Started:</span>
      <span>{{
          new Date(createdAt).toLocaleDateString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Berlin"
          })
        }}</span>
    </li>
    <li @click="expand=!expand" class="expand p-0 list-group-item d-flex justify-content-center">
      <i v-if="!expand" class="text-info bi bi-caret-down-fill"></i>
      <i v-else class="text-info bi bi-caret-up-fill"></i>
    </li>
    <li class="list-group-item bg-light">
      <div class="justify-content-between d-flex">
        <div>
          <a :href="url + '/download'">
            <i class="bi bi-download text-dark fs-5 me-3"></i>
          </a>
          <a>
            <i class="bi bi-star-fill text-warning fs-5" @click="$emit('bookmarked', data, false)" v-if="bookmark"></i>
            <i v-else class="bi bi-star text-warning fs-5" @click="$emit('bookmarked', data, true)"></i>
          </a>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary me-2" @click="$emit('preview', data)">
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
    duration: { type: Number, required: true },
    size: Number,
    bitRate: Number,
    width: Number,
    height: Number,
    createdAt: String,
  },
  computed: {
    durationFormatted() {
      return (this.duration / 60).toFixed(2);
    }
  },
  data() {
    return {
      expand: false,
    };
  },
  methods: {},
});
</script>

<style lang="scss" scoped>
.expand {
  background: ghostwhite;
}
.expand:hover {
  background: darken(ghostwhite, 1%);
}
</style>
