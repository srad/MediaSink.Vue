<template>
  <FavButton v-if="!busy" :data="{}" :faved="fav" @fav="bookmark" @unfav="bookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

<script lang="ts">
import { createClient } from '@/services/api/v1/ClientFactory';
import { defineComponent } from 'vue';
import { AxiosError } from 'axios';
import FavButton from '@/components/controls/FavButton.vue';

const api = createClient();

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
        api.channels.unfavPartialUpdate(this.channel)
            .then(() => this.fav = false)
            .catch((err: AxiosError) => alert(err.response?.data))
            .finally(() => this.busy = false);
      } else {
        api.channels.favPartialUpdate(this.channel)
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
