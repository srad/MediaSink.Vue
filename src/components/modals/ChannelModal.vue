<template>
  <div class="modal fade border-primary" ref="addChannelModal" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-primary shadow-sm border-2 border">
        <div class="modal-header bg-primary text-white rounded-0">
          <h5 class="modal-title" id="exampleModalToggleLabel2">{{ myTitle }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="url" class="form-label fw-bold">URL</label>
            <div class="input-group mb-3">
              <input type="url" required autocomplete="off" ref="url" class="form-control" id="url" v-model="myUrl" @input="recommendChannelName">
              <button class="btn btn-outline-secondary" type="button" id="button-addon1" @click="paste">
                Paste
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label for="display" class="form-label fw-bold">Display name</label>
            <input type="text" required autocapitalize="off" autocomplete="off" class="form-control" id="display" v-model="myDisplayName">
            <div class="fs-6 my-2">Displayed as stream name. Can be changed at any time.</div>
          </div>

          <div class="mb-3">
            <label for="channel" class="form-label fw-bold">Channel name</label>
            <input type="text" required autocapitalize="off" autocomplete="off" class="form-control" id="channel" :disabled="channelDisabled" v-model="myChannelName">
            <div v-if="!channelDisabled" class="fs-6 my-2">
              Only <span class="badge bg-info">a-z</span> and <span class="badge bg-info">_</span> allowed.
              This will also be the parent folder name for all recordings of this service.
            </div>
            <div v-else class="fs-6 my-2">
              This field is the file system folder name and cannot be changed.
            </div>
          </div>

          <div class="mb-3">
            <label for="skip" class="form-label fw-bold">Skip start (seconds)</label>
            <input type="number" required min="0" class="form-control" id="skip" v-model="mySkipStart">
            <div class="fs-6 my-2">
              Some broadcasters have certain number of seconds ads at the video start.
              Define how many seconds at start should be skipped when recording, i.e. for Twitch 15s.
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button class="btn btn-primary" @click="save" :disabled="saving">
            <div class="spinner-border spinner-border-sm text-light" role="status" v-show="saving">
              <span class="visually-hidden">Loading...</span>
            </div>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Modal } from 'bootstrap';
import { defineComponent } from 'vue';

const channelParser = /^[a-z_0-9]+$/i;

interface ChannelModalData {
  channelId?: number;
  modal?: Modal;
  myChannelName: string;
  myDisplayName: string;
  mySkipStart: number;
  myUrl: string;
  myTitle: string;
  saving: boolean;
}

export default defineComponent({
  name: 'ChannelModal',
  emits: ['save', 'close'],
  props: {
    channelDisabled: { type: Boolean, required: false, default: false },
    clear: { type: Boolean, required: true },
    show: { type: Boolean, required: true },
    channelId: { type: Number, required: false },
    channelName: { type: String, required: false },
    displayName: { type: String, required: false },
    url: { type: String, required: false },
    skipStart: { type: Number, required: false },
    title: { type: String, required: true },
  },
  data(): ChannelModalData {
    return {
      modal: undefined,
      myTitle: this.title,
      myUrl: this.url || '',
      myDisplayName: this.displayName || '',
      myChannelName: this.channelName || '',
      mySkipStart: this.skipStart || 0,
      saving: false,
    };
  },
  watch: {
    clear(val) {
      if (val) {
        this.myChannelName = '';
        this.myUrl = '';
        this.myDisplayName = '';
        this.mySkipStart = 0;
      }
    },
    show(val) {
      if (val) {
        this.modal?.show();
        this.saving = false;
        (this.$refs.url as HTMLInputElement).focus();
      } else {
        this.modal?.hide();
      }
    },
    url(val) {
      this.myUrl = val;
    },
    channelName(val) {
      this.myChannelName = val;
    },
    displayName(val) {
      this.myDisplayName = val;
    },
    skipStart(val) {
      this.mySkipStart = val;
    }
  },
  methods: {
    async paste() {
      this.myUrl = await navigator.clipboard.readText();
      this.recommendChannelName();
    },
    recommendChannelName() {
      if (this.channelDisabled) {
        return;
      }
      const find = this.myUrl.toLowerCase()
          .split('/')
          .find(s => channelParser.test(s));

      if (find) {
        if (this.myChannelName === '') {
          this.myChannelName = find;
        }
        if (this.myDisplayName === '') {
          this.myDisplayName = find;
        }
      }
    },
    save() {
      if (/[a-z_]+/i.test(this.myChannelName)) {
        this.$emit('save', {
          channelId: this.channelId,
          channelName: this.myChannelName,
          url: this.myUrl,
          displayName: this.myDisplayName,
          skipStart: this.mySkipStart
        });
        this.saving = true;
      } else {
        alert('Invalid values');
      }
    }
  },
  mounted() {
    this.modal = new Modal(this.$refs.addChannelModal as HTMLElement);
  }
});
</script>

<style scoped>

</style>
