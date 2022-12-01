<template>
  <ul class="list-group list-group-flush border-top border-secondary">
    <li class="list-group-item d-flex justify-content-center">
      <span>
        {{ $t("recording.durationMinutes", [durationFormatted]) }}
      </span>
      <span class="text-secondary px-2">/</span>
      <span>
        {{ (size / 1000 / 1000 / 1000).toFixed(1) }}GB
      </span>
      <span class="text-secondary px-2">/</span>
      <span>
        {{ $t("recording.ago", [ago]) }}
      </span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ $t("recording.bitRate") }}</span>
      <span>{{ $t("recording.bitRateMBit", [(bitRate/1024/1024).toFixed(2)]) }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ $t("recording.resolution") }}</span> <span>{{ width }}x{{ height }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ $t("recording.started") }}</span>
      <span>{{ $d(new Date(createdAt), "short") }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <div>{{ $t("recording.convert") }}</div>
      <div class="btn-group btn-group-sm">
        <button v-if="height !== 720" class="btn btn-sm btn-warning" @click="$emit('convert', {recording: data, mediaType: '720'})">
          720p
        </button>
        <button v-if="height !== 1080" class="btn btn-sm btn-warning" @click="$emit('convert', {recording: data, mediaType: '1080'})">
          1080p
        </button>
        <!--<button class="btn btn-sm btn-warning" @click="$emit('convert', {recording: data, mediaType: 'mp3'})">MP3</button>-->
      </div>
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
        <div class="d-flex">
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
import moment from 'moment';

export default defineComponent({
  name: 'RecordInfo',
  emits: ['preview', 'destroy', 'bookmarked', 'convert'],
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
    durationFormatted(): string {
      return (this.duration / 60).toFixed(2);
    }
  },
  data() {
    return {
      expand: false,
      ago: moment(this.createdAt).fromNow()
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
