<template>
  <ul class="list-group list-group-flush videoinfo-list" style="font-size: 65%">
    <li class="list-group-item d-flex justify-content-evenly gap-1">
      <div>
        <i class="bi bi-stopwatch-fill me-1" />
        <span>{{ t("recording.durationMinutes", [durationFormatted]) }}</span>
      </div>

      <div>
        <i class="bi bi-sd-card-fill me-1" />
        <span>{{ (size / 1024 / 1024 / 1024).toFixed(1) }}GB</span>
      </div>

      <div>
        <i class="bi bi-calendar4-event me-1" />
        <span class="text-cut">{{ ago }}</span>
      </div>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.bitRate") }}</span>
      <span>{{ (bitRate / 1024 / 1024).toFixed(2) }} MBit</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.resolution") }}</span>
      <span>{{ width }}x{{ height }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.started") }}</span>
      <span>{{ createdAtFormatted }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <div>{{ t("recording.convert") }}</div>
      <div class="btn-group">
        <button v-if="height !== 720" class="btn btn-light" @click="emit('convert', {recording: data, mediaType: '720'})">720p</button>
        <button v-if="height !== 1080" class="btn btn-light" @click="emit('convert', {recording: data, mediaType: '1080'})">1080p</button>
        <!--<button class="btn btn-sm btn-warning" @click="emit('convert', {recording: data, mediaType: 'mp3'})">MP3</button>-->
      </div>
    </li>
    <li v-if="false" @click="expand = !expand" class="expand p-0 list-group-item d-flex justify-content-center expand-control" :class="{expanded: expand}">
      <i v-if="!expand" class="bi bi-caret-down-fill"></i>
      <i v-else class="bi bi-caret-up-fill"></i>
    </li>
    <li class="list-group-item fs-6 video-controls rounded-bottom-2">
      <div class="justify-content-between d-flex">
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-sm p-0 px-2" :href="url + '/download'">
            <i class="bi bi-download"></i>
          </button>
          <FavButton :data="data" :faved="bookmark" @fav="emit('bookmarked', props.data, false)" @unfav="emit('bookmarked', props.data, true)" />
        </div>

        <div class="d-flex">
          <button type="button" class="btn btn-sm p-0 px-2" @click="emit('preview', data)">
            <i class="bi bi-film"></i>
          </button>
          <button type="button" class="btn btn-sm p-0 px-2" @click="emit('destroy', data)">
            <i class="bi bi-trash3-fill text-danger" />
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import {computed, ref} from "vue";
  import {useI18n} from "vue-i18n";
  import type {DatabaseRecording as RecordingResponse} from "../services/api/v1/StreamSinkClient.ts";
  import {fromNow} from "../utils/datetime";
  import FavButton from "./controls/FavButton.vue";

  const {t} = useI18n();

  const emit = defineEmits<{
    (e: "preview", value: RecordingResponse): void;
    (e: "destroy", value: RecordingResponse): void;
    (e: "bookmarked", data: RecordingResponse, value: boolean): void;
    (e: "convert", value: {recording: RecordingResponse; mediaType: string}): void;
  }>();

  const props = defineProps<{
    //index: number
    url: string;
    bookmark: boolean;
    data: RecordingResponse;
    duration: number;
    size: number;
    bitRate: number;
    width: number;
    height: number;
    createdAt: string;
    disableButtons?: boolean;
  }>();

  const durationFormatted = computed(() => (props.duration / 60).toFixed(2));

  const createdAtFormatted = computed(() =>
    new Date(props.createdAt).toLocaleDateString(undefined, {
      hour: "numeric",
      minute: "numeric",
    }),
  );

  const ago = ref(fromNow(Date.parse(props.createdAt)));

  const expand = ref(false);
</script>

<style scoped lang="scss">
  @use "@/assets/custom-bootstrap.scss" as bootstrap;

  [data-bs-theme="light"] {
    .video-controls {
      background: bootstrap.$info-bg-subtle;
    }
  }

  [data-bs-theme="dark"] {
    .expand-control {
      background: #4b4e6d;
      color: bootstrap.$white;
    }

    .video-controls {
      background: bootstrap.$primary;
      color: bootstrap.$white;
    }
  }

  .expand {
    background: ghostwhite;
  }

  .btn:disabled {
    border: none;
  }
</style>
