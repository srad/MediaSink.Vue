<template>
  <RouterLink class="navbar-brand text-white fw-bold d-flex p-0 m-0 align-items-center" to="/streams/live">
    <img class="icon" alt="icon" src="/icons2/icon.png" />
    <div class="d-none d-sm-block ms-2git">{{ props.title }}</div>
  </RouterLink>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{ title: string }>();
</script>

<style>
.icon {
  display: inline-block;
  height: 40px;
  width: auto;
  animation: rotate 15s linear infinite; /* Animation for rotation */
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
