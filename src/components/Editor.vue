<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="mb-1 row">
          <label class="text-center col-3 col-form-label">Start</label>
          <div class="col">
            <input type="text" v-model="start" disabled class="form-control form-control-sm">
          </div>
        </div>
        <div class="mb-1 row">
          <label class="text-center col-3 col-form-label">End</label>
          <div class="col">
            <input type="text" v-model="end" disabled class="form-control form-control-sm">
          </div>
        </div>

        <div class="btn-group btn-group-sm w-100">
          <button @click="markStart" class="btn btn-success">start</button>
          <button @click="markEnd" class="btn btn-dark">end</button>
          <button @click="add" class="btn btn-primary">add</button>
        </div>
      </div>
    </div>

    <ul class="list-group bg-white" style="max-height: 400px; overflow-y: scroll">
      <li v-for="time in sortedTimestamps" class="list-group list-group-flush" :key="time.id">
        <div class="btn-group btn-group-sm m-1">
          <button class="btn btn-outline-success" @click="$emit('start', time.start)">
            {{ time.start }}
          </button>
          <button class="btn btn-outline-dark" @click="$emit('end', time.end)">
            {{ time.end }}
          </button>
          <button class="btn btn-danger" @click="destroy(time.id)">
            x
          </button>
        </div>
      </li>
    </ul>
    <hr/>
    <button class="btn btn-primary btn-sm"
            @click="$emit('data', timestamps.map(time => ([time.start, time.end])))">Export
    </button>
  </div>
</template>

<script lang="ts">

export default {
  name: "Editor",
  data() {
    return {
      counter: 0,
      start: 0,
      end: 0,
      timestamps: []
    };
  },
  model: {
    prop: "timestamp",
    event: "change"
  },
  props: {
    timestamp: {
      type: Number,
      default: 0
    }
  },
  watch: {
    start(val) {
      if (this.end <= val) {
        this.end = this.start;
      }
    }
  },
  computed: {
    sortedTimestamps() {
      return this.timestamps.slice().sort((a, b) => a.start - b.start);
    }
  },
  methods: {
    add() {
      if (this.end <= this.start) {
        alert(`End time ${this.end} must be bigger than start time ${this.start}`);
      }
      if (Math.abs(this.end - this.start) < 0.1) {
        alert(`Start and end time too close ${this.start}:${this.end}`);
        return;
      }
      const data = {id: this.counter, start: this.start, end: this.end};
      this.timestamps.push(data);
      this.counter += 1;
      this.$emit("add", data);
    },
    markStart() {
      this.start = this.timestamp;
    },
    markEnd() {
      this.end = this.timestamp;
    },
    destroy(id) {
      for (let i = 0; i < this.timestamps.length; i += 1) {
        if (this.timestamps[i].id === id) {
          this.$emit("destroy", this.timestamps[i]);
          this.timestamps.splice(i, 1);
          break;
        }
      }
    }
  }
};
</script>

<style scoped>
</style>
