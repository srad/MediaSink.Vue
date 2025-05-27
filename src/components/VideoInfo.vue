<template>
  <ul class="list-group list-group-flush videoinfo-list">
    <li class="list-group-item d-flex justify-content-evenly gap-1">
      <div style="min-width: 0; overflow: hidden; white-space: nowrap">
        <i class="bi bi-stopwatch-fill me-1" />
        <span class="text-truncate">{{ t("recording.durationMinutes", [durationFormatted]) }}</span>
      </div>

      <div style="min-width: 0; overflow: hidden; white-space: nowrap">
        <i class="bi bi-sd-card-fill me-1" />
        <span class="text-truncate">{{ (size / 1024 / 1024 / 1024).toFixed(1) }}GB</span>
      </div>

      <div style="min-width: 0; overflow: hidden; white-space: nowrap">
        <i class="bi bi-calendar4-event me-1" />
        <span class="text-truncate">{{ ago }}</span>
      </div>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.bitRate") }}</span>
      <span>{{ (bitRate / 1024 / 1024).toFixed(2) }} MBit</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.resolution") }}</span>
      <span>{{ width }}x{{ props.height }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <span>{{ t("recording.started") }}</span>
      <span>{{ createdAtFormatted }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between">
      <div>{{ t("recording.convert") }}</div>
      <div class="btn-group">
        <button v-if="props.height !== 720" class="btn btn-light" @click="emit('convert', { recording: data, mediaType: '720' })">720p</button>
        <button v-if="props.height !== 1080" class="btn btn-light" @click="emit('convert', { recording: data, mediaType: '1080' })">1080p</button>
        <!--<button class="btn btn-sm btn-warning" @click="emit('convert', {recording: data, mediaType: 'mp3'})">MP3</button>-->
      </div>
    </li>
    <li v-if="false" @click="expand = !expand" class="expand p-0 list-group-item d-flex justify-content-center expand-control" :class="{ expanded: expand }">
      <i v-if="!expand" class="bi bi-caret-down-fill"></i>
      <i v-else class="bi bi-caret-up-fill"></i>
    </li>
    <li class="list-group-item fs-6 video-controls rounded-bottom-2">
      <div class="justify-content-between d-flex">
        <div class="d-flex gap-2">
          <a class="btn-link btn-sm p-0 px-2" @click="download">
            <i class="bi bi-download"></i>
          </a>
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
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { DatabaseRecording as RecordingResponse } from "../services/api/v1/MediaSinkClient.ts";
import { fromNow } from "../utils/datetime";
import FavButton from "./controls/FavButton.vue";
import { useAuthStore } from "../stores/auth";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "preview", value: RecordingResponse): void;
  (e: "destroy", value: RecordingResponse): void;
  (e: "bookmarked", data: RecordingResponse, value: boolean): void;
  (e: "convert", value: { recording: RecordingResponse; mediaType: string }): void;
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

const download = async () => {
  await downloadWithFetch(props.url, props.data.filename);
};

async function downloadWithFetch(url: string, filename: string = '') {
  try {
    // 1. Fetch the data from the URL
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    // 2. Get the data as a Blob
    const blob = await response.blob();

    // 3. Create an object URL for the Blob
    const objectUrl = window.URL.createObjectURL(blob);

    // 4. Use the anchor tag method to trigger the download
    const link = document.createElement('a');
    link.href = objectUrl;

    // Try to determine filename if not provided
    if (!filename) {
      // Try to get filename from Content-Disposition header
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      // Fallback to URL path segment
      if (!filename) {
        filename = url.substring(url.lastIndexOf('/') + 1);
      }
    }

    link.download = filename || 'downloaded-file'; // Provide a fallback filename

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. Revoke the object URL to free up memory
    window.URL.revokeObjectURL(objectUrl);

  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download the file. Check console for details.');
  }
}

async function downloadWithFetchAndAuth(url: string, token: string, filename: string = '') {
  try {
    // 1. Define the headers, including the Authorization Bearer token
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    // 2. Fetch the data from the URL, now including the headers
    const response = await fetch(url, {
      method: 'GET', // Or 'POST', 'PUT', etc., if your API requires it
      headers: headers,
    });

    // Check if the request was successful
    if (!response.ok) {
      // Handle potential auth errors (401, 403) or other issues
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    // 3. Get the data as a Blob
    const blob = await response.blob();

    // 4. Create an object URL for the Blob
    const objectUrl = window.URL.createObjectURL(blob);

    // 5. Use the anchor tag method to trigger the download
    const link = document.createElement('a');
    link.href = objectUrl;

    // Try to determine filename if not provided
    if (!filename) {
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      if (!filename) {
        filename = url.substring(url.lastIndexOf('/') + 1) || 'downloaded-file';
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 6. Revoke the object URL to free up memory
    window.URL.revokeObjectURL(objectUrl);

  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download the file. Check console for details or if you are authorized.');
  }
}
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
