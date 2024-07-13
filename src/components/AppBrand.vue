<template>
  <a class="navbar-brand text-white fw-bold d-flex" href="/streams">
    <img alt="icon" class="px-2" style="height: 28px; width: auto" src="/icon.png"/>
    <span class="d-none d-sm-block">{{ props.title }}</span>
  </a>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{ title: string }>();
</script>

<style scoped>
</style>