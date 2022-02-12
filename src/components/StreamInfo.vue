<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-between">
      <div>
        <span class="badge me-2" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span v-if="channel.isRecording">Recorded: {{ minutes }}:{{ seconds }}min</span>
      <span v-else>&nbsp;</span>
      <div>
        <span><i class="bi bi-device-hdd"></i> {{ (channel.recordingsSize / 1000 / 1000 / 1000).toFixed(1) }}GB</span>
        |
        <span>Videos: {{ channel.recordingsCount }}</span>
      </div>
    </li>
    <li class="list-group-item">
      <template v-if="!showTagInput && channel.tags !== '' && tagArray.length > 0">
        <span class="badge bg-secondary text-dark me-1" :key="tag" v-for="tag in tagArray">{{ tag }}
          <span @click="destroyTag(tag)" class="bi bi-x"></span>
        </span>
      </template>
      <div v-if="showTagInput" class="input-group input-group-sm">
        <input type="text" class="form-control form-control-sm" v-model.lazy="tagVal">
        <button class="btn btn-sm btn-success" @click="addTag">save</button>
      </div>
      <span v-else class="badge bg-success" @click="showTagInput=true">
          <span class="bi bi-plus"></span>
      </span>
    </li>
    <li class="list-group-item bg-light d-flex justify-content-between">
      <div class="form-check form-switch">
        <input @click="$emit('pause', channel)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" id="flexSwitchCheckDefault">
        <label class="form-check-label" for="flexSwitchCheckDefault">Record</label>
      </div>
      <button class="btn btn-sm btn-danger float-end" @click="$emit('destroy', channel)">Delete</button>
    </li>
  </ul>
</template>

<script lang="ts">
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
import { PropType, defineComponent } from 'vue';

const channelApi = new ChannelApi();

interface ChannelItemData {
  tagArray: string[];
  tagVal: string;
  showTagInput: boolean;
  thread: number;
  secRecording: number;
}

export default defineComponent({
  name: 'StreamInfo',
  props: {
    channel: { type: Object as PropType<ChannelResponse>, required: true }
  },
  computed: {
    minutes(): string {
      return (this.secRecording / 60).toFixed(0);
    },
    seconds(): string {
      let x = (this.secRecording % 60).toFixed(0);
      return (x.length < 10 ? '0' + String(x) : x);
    }
  },
  data(): ChannelItemData {
    return {
      tagArray: this.channel.tags !== '' ? this.channel.tags.split(',') : [],
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

      const newTags = [...this.tagArray];
      newTags.push(tag);
      channelApi.tags(this.channel.channelName, newTags)
          .then(() => {
            this.tagArray.push(tag);
            this.showTagInput = false;
            this.tagVal = '';
          });
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
