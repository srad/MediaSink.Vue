<template>
  <div class="modal fade border-primary" ref="addChannelModal" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-primary shadow-sm border-2 border">
        <div class="modal-header bg-primary text-white rounded-0">
          <h5 class="modal-title" id="exampleModalToggleLabel2">{{ myTitle }}</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" @click="emit('close')"></button>
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

          <div class="mb-3">
            <div class="form-check form-switch">
              <input type="checkbox" required :checked="myIsPaused" class="form-check-input" id="pause" v-model="myIsPaused">
              <label class="form-check-label">Pause Recording</label>
            </div>
            <div class="fs-6 my-2">
              Do not record as long as paused.
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light">
          <button class="btn btn-primary" @click="save" :disabled="saving">
            <span class="spinner-border spinner-border-sm text-light" role="status" v-show="saving">
              <span class="visually-hidden">Loading...</span>
            </span>
            Save
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Modal } from 'bootstrap';
import { defineProps, defineEmits, watch, onMounted, ref } from 'vue';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  channelDisabled?: boolean
  clear: boolean
  isPaused: boolean
  show: boolean
  channelId?: number
  channelName?: string
  displayName?: string
  url?: string
  skipStart?: number
  title: string
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const channelParser = /^[a-z_0-9]+$/i;

let modal: Modal | null = null;
const myIsPaused = ref(props.isPaused);
const myTitle = ref(props.title);
const myUrl = ref(props.url || '');
const myDisplayName = ref(props.displayName || '');
const myChannelName = ref(props.channelName || '');
const mySkipStart = ref(props.skipStart || 0);
const saving = ref(false);

const url = ref<HTMLInputElement | null>(null);
const addChannelModal = ref<HTMLDivElement | null>(null);

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

export interface ChannelUpdate {
  isPaused: boolean,
  channelId: number,
  channelName: string,
  url: string,
  displayName: string,
  skipStart: number
}

const emit = defineEmits<{
  (e: 'save', value: ChannelUpdate): void
  (e: 'close'): void
}>();

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => modal = new Modal(addChannelModal.value!));

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.clear, (val) => {
  if (val) {
    myChannelName.value = '';
    myUrl.value = '';
    myDisplayName.value = '';
    mySkipStart.value = 0;
  }
});

watch(() => props.show, (val) => {
  if (val) {
    modal?.show();
    saving.value = false;
    url.value?.focus();
  } else {
    modal?.hide();
  }
});

// Listen for form changes.
// Reason for all this: This is an optimisation to only have one modal instance.
watch(() => props.title, _ => myTitle.value = props.title);
watch(() => props.isPaused, _ => myIsPaused.value = props.isPaused);
watch(() => props.url, _ => myUrl.value = props.url || "");
watch(() => props.displayName, _ => myDisplayName.value = props.displayName || "");
watch(() => props.channelName, _ => myChannelName.value = props.channelName || "");
watch(() => props.skipStart, _ => mySkipStart.value = props.skipStart || 0);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const paste = async () => {
  myUrl.value = await navigator.clipboard.readText();
  recommendChannelName();
};

const recommendChannelName = () => {
  if (props.channelDisabled) {
    return;
  }

  const find = myUrl.value.toLowerCase()
      .split('/')
      .find(s => channelParser.test(s));

  if (find) {
    if (myChannelName.value === '') {
      myChannelName.value = find;
    }
    if (myDisplayName.value === '') {
      myDisplayName.value = find;
    }
  }
};

const save = () => {
  if (/[a-z_]+/i.test(myChannelName.value)) {
    emit('save', {
      isPaused: myIsPaused.value,
      channelId: props.channelId!,
      channelName: myChannelName.value,
      url: myUrl.value,
      displayName: myDisplayName.value,
      skipStart: mySkipStart.value
    });
    saving.value = true;
  } else {
    alert('Invalid values');
  }
};
</script>

<style scoped>
</style>