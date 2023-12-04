<template>
  <FavButton v-if="!busy" :data="{}" :faved="fav" @fav="bookmark" @unfav="bookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

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
      busy: false,
      fav: this.bookmarked,
    };
  },
  methods: {
    bookmark() {
      this.busy = true;
      if (this.fav) {
        api.unfav(this.channel)
            .then(() => this.fav = false)
            .catch((err: AxiosError) => alert(err.response?.data))
            .finally(() => this.busy = false);
      } else {
        api.fav(this.channel)
            .then(() => this.fav = true)
            .catch((err: AxiosError) => alert(err.response?.data))
            .finally(() => this.busy = false);
      }
    },
  }
});
</script>

<style scoped>

</style>