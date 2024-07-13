<template>
  <FavButton v-if="!busy" :data="{}" :faved="fav" @fav="bookmark" @unfav="bookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { createClient } from '../services/api/v1/ClientFactory';
import { ref, defineProps } from 'vue';
import FavButton from './controls/FavButton.vue';

const api = createClient();

const props = defineProps<{
  bookmarked: boolean
  channelId: number
}>();

const busy = ref(false);
const fav = ref(props.bookmarked);

const bookmark = () => {
  busy.value = true;
  if (fav.value) {
    alert(props.channelId);
    api.channels.unfavPartialUpdate(props.channelId)
        .then(() => fav.value = false)
        .catch(res => alert(res.error))
        .finally(() => busy.value = false);
  } else {
    api.channels.favPartialUpdate(props.channelId)
        .then(() => fav.value = true)
        .catch(res => alert(res.error))
        .finally(() => busy.value = false);
  }
};
</script>

<style scoped>
</style>