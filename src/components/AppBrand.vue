<template>
  <a class="navbar-brand text-white fw-bold d-flex" href="/streams">
    <img class="px-2" style="height: 28px; width: auto" src="/icon.png"/>
    <span class="d-none d-sm-block">{{ title }}</span>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppBrand',
  props: {
    title: { type: String, required: true }
  }
});
</script>

<style scoped>

</style>
