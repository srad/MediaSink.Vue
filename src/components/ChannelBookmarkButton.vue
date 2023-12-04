<script lang="ts">
import { ChannelApi, ChannelResponse } from '@/services/api/v1/channelApi';
import { defineComponent, PropType } from 'vue';
import { AxiosError } from 'axios';
import FavButton from "@/components/controls/FavButton.vue";

const api = new ChannelApi();

export default defineComponent({
  name: 'ChannelBookmarkButton',
  components: { FavButton },
  props: {
    bookmarked: { type: Boolean, required: true },
    channelName: { type: String, required: true },
  },
  data() {
    return {
      channel: this.channelName,
      file: this.fileName,
      busy: false
    };
  },
  methods: {
    bookmark(data: Object, yesNo: boolean) {
      this.busy = true;
      api.fav(this.channel)
          .catch((err: AxiosError) => alert(err.response?.data))
          .finally(() => this.busy = false);
    },
    unbookmark(data: Object, yesNo: boolean) {
      this.busy = true;
      api.unfav(this.channel)
          .catch((err: AxiosError) => alert(err.response?.data))
          .finally(() => this.busy = false);
    },
  }
});
</script>

<template>
  <FavButton v-if="!busy" :data="{}" :faved="bookmarked" @fav="bookmark" @unfav="unbookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

<style scoped>

</style>