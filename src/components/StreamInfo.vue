<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-between">
      <div>
        <span class="badge me-2 user-select-none" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge user-select-none" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>
    <li class="list-group-item d-flex justify-content-between">
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
    <li class="list-group-item">
      <template v-if="!showTagInput && tagArray.length > 0">
        <span v-for="tag in tagArray" class="badge bg-secondary text-dark me-1 user-select-none" :key="tag">{{ tag }}
          <span @click="destroyTag(tag)" class="bi bi-x"></span>
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
    <li class="list-group-item bg-light d-flex justify-content-between">
      <div class="d-flex">
        <span class="form-check form-switch py-1 me-2">
          <input @click="$emit('pause', channel)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" id="flexSwitchCheckDefault">
          <label class="form-check-label" for="flexSwitchCheckDefault">Record</label>
        </span>
        <span>
          <i class="bi bi-star-fill text-warning fs-5" @click="$emit('unfav', channel)" v-if="fav"></i>
          <i v-else class="bi bi-star text-warning fs-5" @click="$emit('fav', channel)"></i>
        </span>
      </div>
      <div>
        <button class="btn btn-sm btn-secondary me-1" @click="$emit('edit', channel)">
          <i class="bi bi-pen"></i>
        </button>
        <button class="btn btn-sm btn-danger" @click="$emit('destroy', channel)">Delete</button>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
import { PropType, defineComponent } from 'vue';
import { parseTags } from '@/utils/parser';

const channelApi = new ChannelApi();

interface ChannelItemData {
  tagVal: string;
  showTagInput: boolean;
  thread: number;
  secRecording: number;
  tagArray: string[];
}

export default defineComponent({
  name: 'StreamInfo',
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
      tagArray: parseTags(this.channel.tags),
      tagVal: '',
      showTagInput: false,
      thread: 0,
      secRecording: this.channel.minRecording * 60
    };
  },
  methods: {
    destroyTag(tag: string) {
      const removeTag = this.tagArray.filter(t => t !== tag);
      channelApi.tags(this.channel.channelName, removeTag)
          .then(() => this.tagArray = removeTag);
    },
    addTag() {
      const tag = this.tagVal.trim().toLowerCase();

      // No value, cancel
      if (tag === '') {
        this.showTagInput = false;
        return;
      }

      try {
        const parsed = parseTags(tag);
        const newTags = [...this.tagArray];
        newTags.push(parsed[0]);

        channelApi.tags(this.channel.channelName, newTags)
            .then(() => {
              this.tagArray = newTags;
              this.showTagInput = false;
              this.tagVal = '';
            });
      } catch (e) {
        alert(e.message);
        this.tagVal = '';
        return;
      }
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
