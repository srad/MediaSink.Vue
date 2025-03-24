<template>
  <ChannelModal @save="save" @close="showModal = false" title="Edit Stream" :saving="saving" :is-paused="isPaused" :channel-disabled="true" :clear="false" :channel-id="channelId" :show="showModal" :channel-name="channelName" :display-name="displayName" :url="url" :min-duration="minDuration" :skip-start="skipStart" />

  <div class="d-flex w-100 mb-2 pe-1">
    <AutoComplete
      input-class="border-info"
      :min-length="1"
      style="width: 100%"
      @item-select="
        (event: AutoCompleteOptionSelectEvent) => {
          //autoSearch = event.value.channelName;
          router.push(`/channel/${event.value.channelId}/${event.value.channelName}`);
        }
      "
      v-model="autoSearch"
      :fluid="true"
      size="large"
      placeholder="Search"
      option-label="channelName"
      :suggestions="autoSearchResults"
      variant="filled">
      <template #option="slotProps">
        <div class="d-flex w-100">
          <div class="flex-fill m-0">
            <div class="d-flex">
              <div class="w-25">{{ slotProps.option.displayName }}</div>
              <div class="w-20 text-start d-none d-md-block">Items: {{ slotProps.option.recordingsCount }}</div>
              <div class="w-20 text-start d-none d-md-block">Size: {{ (slotProps.option.recordingsSize / 1024 / 1024 / 1024).toFixed(1) }}GB</div>
            </div>
            <div v-if="slotProps.option.tags">
              <span class="badge bg-info me-2" v-for="tag in slotProps.option.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <img class="p-0 m-0" :alt="slotProps.option.channelName" :src="`${fileUrl}/${slotProps.option.preview}`" style="height: 50px" />
        </div>
      </template>
    </AutoComplete>
    <span class="input-group-text ms-2" style="color: deeppink">
      <i v-if="favs" class="bi bi-heart-fill fs-4" @click="favs = false" />
      <i v-else class="bi bi-heart fs-4" @click="favs = true" />
    </span>
  </div>

  <!-- Body -->
  <LoadIndicator :busy="isLoading">
    <div class="row">
      <div class="col">
        <ul class="nav nav-tabs border-primary" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" @click="() => show('live')" :class="{ active: tab === 'live' }" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
              <span class="d-none d-lg-inline">Recording</span>
              <span class="d-flex justify-content-between">
                <span class="d-lg-none">Rec</span>
                <span class="recording-number">{{ channelStore.recordingStreams.length }}</span>
              </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" @click="() => show('offline')" :class="{ active: tab === 'offline' }" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
              <span class="d-none d-lg-inline">Offline</span>
              <span class="d-flex justify-content-between">
                <span class="d-lg-none">Off</span><span class="recording-number">{{ channelStore.notRecordingStreams.length }}</span>
              </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" @click="() => show('disabled')" :class="{ active: tab === 'disabled' }" id="disabled-tab" data-bs-toggle="tab" data-bs-target="#disabled" type="button" role="tab" aria-controls="disabled" aria-selected="false">
              <span class="d-none d-lg-inline">Disabled</span>
              <span class="d-flex justify-content-between">
                <span class="d-lg-none">Disabled</span><span class="recording-number">{{ channelStore.disabledStreams.length }}</span>
              </span>
            </button>
          </li>
        </ul>

        <div class="tab-content py-2" id="myTabContent">
          <div class="tab-pane fade" :class="{ 'active show': tab === 'live' }" id="home" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
              <div v-for="channel in channelStore.recordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel" />
              </div>
              <h1 v-if="channelStore.recordingStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">No disabled streams</h1>
            </div>
          </div>

          <div class="tab-pane fade" :class="{ 'active show': tab === 'offline' }" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
              <div v-for="channel in channelStore.notRecordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel" />
              </div>
              <h1 v-if="channelStore.notRecordingStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">No disabled streams</h1>
            </div>
          </div>

          <div class="tab-pane fade" :class="{ 'active show': tab === 'disabled' }" id="disabled" role="tabpanel" aria-labelledby="disabled-tab">
            <div class="row">
              <div v-for="channel in channelStore.disabledStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel" />
              </div>
              <h1 v-if="channelStore.disabledStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">No disabled streams</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Body end -->
  </LoadIndicator>
</template>

<script setup lang="ts">
import type { DatabaseChannel as ChannelResponse, ServicesChannelInfo } from "@/services/api/v1/StreamSinkClient";
import ChannelItem from "@/components/ChannelItem.vue";
import ChannelModal from "@/components/modals/ChannelModal.vue";
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoadIndicator from "@/components/LoadIndicator.vue";
import { sortChannel, useChannelStore } from "@/stores/channel.ts";
import type { ChannelUpdate } from "@/types/channel";
import AutoComplete, { type AutoCompleteOptionSelectEvent } from "primevue/autocomplete";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const route = useRoute();
const channelItemClass = "col-lg-6 col-xl-4 col-xxl-3 col-md-6 col-sm-8";
const channelId = ref<number>();
const showModal = ref(false);
const channelName = ref("");
const displayName = ref("");
const isPaused = ref(false);
const url = ref("");
const minDuration = ref(20);
const skipStart = ref(0);
const favs = ref(route.query.fav === "1");

const isLoading = ref(true);

const saving = ref(false);

const autoSearch = ref<string>((route.query.search || route.query.tag || route.params.tag || "") as string);

const router = useRouter();

const tab = ref(route.params.tab);

const channelStore = useChannelStore();

const fileUrl = inject("fileUrl") as string;

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const autoSearchResults = computed(() =>
  channelStore.all
    .filter((channel: ServicesChannelInfo) => searchFilter(channel, searchTerms.value, tagTerms.value))
    .filter((channel: ServicesChannelInfo) => (favs.value ? channel.fav : true)) // Only use, if defined.
    .sort(sortChannel),
);

// --------------------------------------------------------------------------------------
// Functions
// --------------------------------------------------------------------------------------

const searchTerms = computed(() =>
  autoSearch.value
    .toLowerCase()
    .trim()
    .split(" ")
    .filter((s) => s[0] !== "#")
    .join(" "),
);

/**
 * Turns "some search #tag1 #tag2" => "tag1 tag2"
 * @param field
 */
const tagTerms = computed(() =>
  autoSearch.value
    .split(" ")
    .filter((s) => s[0] === "#")
    .map((s) => s.slice(1, s.length))
    .join(" "),
);

const searchFilter = (channel: ChannelResponse, search: string, tag: string): boolean => {
  return (search && search.length > 0 ? channel.channelName!.indexOf(search) !== -1 : true) && (tag && tag.length > 0 && channel.tags ? channel.tags.some((t) => t === tag) : true);
};

const save = async (channel: ChannelUpdate) => {
  try {
    saving.value = true;
    await channelStore.save(channel);
    showModal.value = false;
  } catch (e) {
    alert(e);
  } finally {
    saving.value = false;
  }
};

const editChannel = (channel: ChannelResponse) => {
  channelId.value = channel.channelId!;
  channelName.value = channel.channelName;
  displayName.value = channel.displayName;
  isPaused.value = channel.isPaused;
  url.value = channel.url;
  skipStart.value = channel.skipStart;
  minDuration.value = channel.minDuration;
  showModal.value = true;
};

const show = (tabName: string) => {
  router.push({ params: { tab: tabName } });
};

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(favs, (val) => router.push({ query: { fav: val ? "1" : "0" } }));

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(async () => {
  await channelStore.load();
  isLoading.value = false;
});
</script>

<style lang="scss" scoped>
.nav-item .active {
  background-color: #4b4e6d;
  color: white;
  border: 1px solid #4b4e6d;
}

.recording-number {
  font-size: 0.8em;
}
</style>
