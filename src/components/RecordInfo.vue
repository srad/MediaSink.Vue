<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-center">
      <span>
        {{ $t('recording.durationMinutes', [durationFormatted]) }}
      </span>
      <span class="text-secondary px-2">/</span>
      <span>
        {{ (size / 1000 / 1000 / 1000).toFixed(1) }}GB
      </span>
      <span class="text-secondary px-2">/</span>
      <span class="text-cut">{{ ago }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between bg-info-light-2">
      <span>{{ $t('recording.bitRate') }}</span>
      <span>{{ (bitRate / 1024 / 1024).toFixed(2) }} MBit</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between bg-info-light-2">
      <span>{{ $t('recording.resolution') }}</span> <span>{{ width }}x{{ height }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between bg-info-light-2">
      <span>{{ $t('recording.started') }}</span>
      <span>{{ new Date(createdAt).toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' }) }}</span>
    </li>
    <li v-if="expand" class="list-group-item d-flex justify-content-between bg-info-light-2">
      <div>{{ $t('recording.convert') }}</div>
      <div class="btn-group">
        <button v-if="height !== 720" class="btn btn-light" @click="$emit('convert', {recording: data, mediaType: '720'})">
          720p
        </button>
        <button v-if="height !== 1080" class="btn btn-light" @click="$emit('convert', {recording: data, mediaType: '1080'})">
          1080p
        </button>
        <!--<button class="btn btn-sm btn-warning" @click="$emit('convert', {recording: data, mediaType: 'mp3'})">MP3</button>-->
      </div>
    </li>
    <li @click="expand=!expand" class="expand p-0 list-group-item d-flex justify-content-center">
      <i v-if="!expand" class="text-info bi bi-caret-down-fill"></i>
      <i v-else class="text-info bi bi-caret-up-fill"></i>
    </li>
    <li class="list-group-item bg-info-light fs-6">
      <div class="justify-content-between d-flex">

        <div class="d-flex justify-content-evenly w-25">
          <a :href="url + '/download'">
            <i class="bi bi-download text-dark"></i>
          </a>
          <FavButton :data="data" :faved="bookmark" @fav="$emit('bookmarked', data, false)" @unfav="$emit('bookmarked', data, true)"/>
        </div>

        <div class="d-flex justify-content-evenly w-25">
          <a @click="$emit('preview', data)">
            <i class="bi bi-film"></i>
          </a>
          <a class="text-danger" @click="$emit('destroy', data)">
            <i class="bi bi-trash3-fill px-2"/>
          </a>
        </div>

      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import moment from 'moment';
import FavButton from '@/components/controls/FavButton.vue';

export default defineComponent({
  name: 'RecordInfo',
  components: { FavButton },
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
    //@ts-ignore
    const ago = moment(Date.parse(this.createdAt)).fromNow();

    return {
      expand: false,
      ago: ago
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
