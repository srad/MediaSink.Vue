<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-between">
      <div>
        <span class="badge me-2" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>
    <li class="list-group-item d-flex justify-content-between">
      <span v-if="channel.isRecording">Recorded: {{ minutes }}:{{ seconds }}min</span>
      <span v-else>&nbsp;</span>
      <div>Videos: {{ channel.recordingsCount }}</div>
    </li>
    <li class="list-group-item bg-light d-flex justify-content-between">
      <div class="form-check form-switch">
        <input @click="$emit('pause', channel)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" id="flexSwitchCheckDefault">
        <label class="form-check-label" for="flexSwitchCheckDefault">Record</label>
      </div>
      <button class="btn btn-sm btn-danger float-end" @click="$emit('destroy', channel)">Delete</button>
    </li>
  </ul>
</template>

<script>

export default {
  name: "StreamInfo",
  props: {
    channel: Object
  },
  computed: {
    minutes() {
      return (this.secRecording / 60).toFixed(0);
    },
    seconds() {
      let x = (this.secRecording % 60).toFixed(0);
      return (x < 10 ? "0" + String(x) : x);
    }
  },
  data() {
    return {
      thread: 0,
      secRecording: this.channel.minRecording * 60
    };
  },
  mounted() {
    if (this.channel.isRecording) {
      this.thread = setInterval(() => {
        this.$nextTick(() => this.secRecording += 1);
      }, 1000);
    }
  },
  unmounted() {
    if (this.channel.isRecording) {
      clearInterval(this.thread);
    }
  }
};
</script>

<style scoped>

</style>
