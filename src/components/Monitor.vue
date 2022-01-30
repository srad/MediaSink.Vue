<template>
  <div class="d-flex p-0 monitor">
    <h5>
    <span class="badge">
      <i class="bi bi-smartwatch"></i>
      {{ uptimeHours }}h
    </span>
    </h5>
    |
    <h5>
    <span class="badge">
      <i class="bi bi-cpu"></i> {{ cpuFormatted }}%
    </span>
    </h5>
    |
    <h5>
      <span class="badge ">Mem {{ usedMem }}GB/ {{ totalMem }}GB</span>
    </h5>
    |
    <h5>
    <span class="badge">
      <i class="bi bi-hdd"></i>
      {{ diskUsed }}/ {{ diskTotal }} ({{ diskPercent }}%)
    </span>
    </h5>
    |
    <h5>
    <span class="badge ">
      <i class="bi bi-hdd-network"></i>
      {{ (netInput / 1024 / 1024).toFixed(1) }}MB (in) {{ (netOutput / 1024 / 1024).toFixed(1) }}MB (out)
    </span>
    </h5>
    |
    <h5>
    <span class="badge ">
      <i class="bi bi-hdd-network"></i>
      {{ (netInTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB (in) {{
        (netOutTraffic / 1024 / 1024 / 1024).toFixed(1)
      }}GB (out)
    </span>
    </h5>
  </div>
</template>

<script>
// function pad(num, size) {
//   const s = "000000000" + num;
//   return s.substr(s.length - size);
// }

export default {
  name: "Monitor",
  computed: {
    uptimeHours() {
      return (this.uptime / 60 / 60).toFixed(2);
    },
    cpuFormatted() {
      return this.cpu; //pad(this.cpu, 6);
    },
    usedMem() {
      return (this.memUsed / 1024).toFixed(2);
    },
    totalMem() {
      return (this.memTotal / 1024).toFixed(2);
    },
    diskPercent() {
      const u = parseInt(this.diskUsed, 10);
      const t = parseInt(this.diskTotal, 10);
      return (u / t * 100).toFixed(2);
    }
  },
  props: {
    cpu: Number,
    uptime: Number,
    memTotal: Number,
    memUsed: Number,
    netInput: Number,
    netOutput: Number,
    netInTraffic: Number,
    netOutTraffic: Number,
    diskUsed: String,
    diskTotal: String,
  },
};
</script>

<style scoped>
.monitor > * {
  margin-right: 0.3rem;
}

.monitor h5 {
  margin: 0;
}
</style>
