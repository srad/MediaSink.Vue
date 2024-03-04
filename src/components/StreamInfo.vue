<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-between bg-info-light bg-gradient">
      <div>
        <span class="badge me-2 user-select-none" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge user-select-none" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>
    <li class="list-group-item d-flex justify-content-between bg-info-light-2">
      <span v-if="channel.isRecording">
        <i class="bi bi-stopwatch me-1"></i>
        <span>{{ minutes }}:{{ seconds }}min</span>
      </span>
      <span v-else>&nbsp;</span>
      <div>
        <span><i class="bi bi-device-hdd"></i> {{
            (channel.recordingsSize / 1000 / 1000 / 1000).toFixed(1)
          }}GB ({{ channel.recordingsCount }})</span>
      </div>
    </li>
    <li class="list-group-item bg-info-light-2">
      <template v-if="!showTagInput && tagArray.length > 0">
        <span v-for="tag in tagArray" @click="$router.push({query: {tag}})" class="badge bg-secondary text-dark me-1 user-select-none" :key="tag">{{ tag }}
          <span @click="destroyTag(tag)" class="bi bi-x" style="z-index: 1"></span>
        </span>
      </template>
      <div v-show="showTagInput" class="input-group input-group-sm">
        <input type="text" class="form-control form-control-sm" ref="tagInput" v-model.lazy="tagVal" autocapitalize="off" autocomplete="off">
        <button class="btn btn-sm btn-success" @click="addTag">save</button>
      </div>
      <span v-show="!showTagInput" class="badge bg-success" @click="showTagInput=true">
          <span class="bi bi-plus"></span>
      </span>
    </li>
    <li class="list-group-item bg-info-light d-flex justify-content-between fs-6">

      <div class="d-flex w-75">
        <span class="form-check form-switch me-2">
          <input @click="$emit('pause', channel)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" id="flexSwitchCheckDefault">
          <label class="form-check-label" for="flexSwitchCheckDefault">Record</label>
        </span>
        <FavButton :data="channel" :faved="fav" @fav="$emit('unfav', channel)" @unfav="$emit('fav', channel)"/>
      </div>

      <div class="d-flex justify-content-evenly w-25">
        <a @click="$emit('edit', channel)" class="me-2">
          <i class="bi bi-pencil-square"></i>
        </a>
        <a class="text-danger" @click="$emit('destroy', channel)">
          <i class="bi bi-trash3-fill"></i>
        </a>
      </div>

    </li>
  </ul>
</template>

<script lang="ts">
import { V1ChannelResponse as ChannelResponse } from '@/services/api/v1/StreamSinkClient';
import { createClient } from '@/services/api/v1/ClientFactory';
import { PropType, defineComponent } from 'vue';
import { parseTags } from '@/utils/parser';
import FavButton from '@/components/controls/FavButton.vue';

const api = createClient();

interface ChannelItemData {
  tagVal: string;
  showTagInput: boolean;
  thread: number;
  secRecording: number;
  tagArray: string[];
}

export default defineComponent({
  name: 'StreamInfo',
  components: { FavButton },
  emits: ['unfav', 'fav', 'edit', 'destroy', 'pause'],
  props: {
    fav: Boolean,
    channel: { type: Object as PropType<ChannelResponse>, required: true }
  },
  watch: {
    showTagInput(val) {
      if (val) {
        (this.$refs.tagInput as HTMLInputElement).focus();
      }
    }
  },
  computed: {
    minutes(): string {
      return (this.secRecording / 60).toFixed(0);
    },
    seconds(): string {
      let x = (this.secRecording % 60).toFixed(0);
      return (x.length < 2 ? '0' + String(x) : x);
    },
  },
  data(): ChannelItemData {
    return {
      tagArray: parseTags(this.channel.tags!),
      tagVal: '',
      showTagInput: false,
      thread: 0,
      secRecording: this.channel.minRecording! * 60
    };
  },
  methods: {
    async destroyTag(tag: string) {
      const removeTag = this.tagArray.filter(t => t !== tag);
      await api.channels.tagsCreate(this.channel.channelName!, { tags: removeTag });
      this.tagArray = removeTag;
    },
    addTag() {
      const tag = this.tagVal.trim().toLowerCase();

      // No value, cancel
      if (tag === '') {
        this.showTagInput = false;
        return;
      }

      const parsed = parseTags(tag);
      const newTags = [...this.tagArray];
      newTags.push(parsed[0]);

      api.channels.tagsCreate(this.channel.channelName!, { tags: newTags })
          .then(() => {
            this.tagArray = newTags;
            this.showTagInput = false;
            this.tagVal = '';
          })
          .catch(e => alert(e.message))
          .finally(() => this.tagVal = '');
    }
  },
  mounted() {
    if (this.channel.isRecording) {
      this.thread = setInterval(() => {
        this.secRecording += 1;
      }, 1000);
    }
  },
  unmounted() {
    if (this.channel.isRecording) {
      clearInterval(this.thread);
    }
  }
});
</script>

<style scoped>

</style>
