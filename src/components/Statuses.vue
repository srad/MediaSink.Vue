<template>
  <div class="table-responsive w-100">
    <table class="table table-sm bg-white shadow-sm table-bordered table-hover">
      <thead class="bg-light text-center align-middle">
      <tr>
        <th class="border-end" style="width:  15%; min-width: 128px;">Preview
        </th>
        <th class="border-end border-bottom">
          <input class="form-control form-control-sm w-100" placeholder="channel" v-model="searchChannel">
        </th>
        <th class="d-none d-md-table-cell border-end">Duration</th>
        <!--<th class="border-end d-none d-lg-table-cell">Write to file</th>-->
        <th class="border-end">Rec?</th>
        <th class="d-none d-md-table-cell border-end">Status</th>
        <th>Delete</th>
      </tr>
      </thead>
      <tbody>
      <tr class="align-middle"
          v-for="channel in filterStatus"
          :key="channel.channelName"
          :class="{'table-danger': channel.isRecording, 'table-success': channel.isOnline}">
        <td class="border-end p-0">
          <img alt="preview"
               @click="$emit('select', channel)"
               @error="errorLoadImage($event.target)"
               style="max-width: 100%; height: auto;"
               :src="baseUrl + '/' + channel.preview">
        </td>
        <td class="text-start border-end">
          <h6 class="mx-1">
            <a target="_blank" :href="channel.url"> {{ channel.channelName }}
              ({{ channel.RecordingsCount }})</a>
          </h6>
        </td>
        <td class="d-none d-md-table-cell">
          <span v-if="channel.isRecording">{{ channel.minRecording.toFixed(2) }}min</span>
          <span v-else>-</span>
        </td>
        <!--
        <td class="d-none d-lg-table-cell border-end">
          <button :disabled="!channel.isRecording"
                  :class="{'btn-dark' : channel.isRecording, 'btn-light': !channel.isRecording}"
                  class="btn btn-sm w-100 p-1"
                  @click="$emit('write', channel)">
            write to file
          </button>
        </td>
        -->
        <td class="text-start border-end">
          <div class="form-check form-check-inline" style="margin-left: .5rem">
            <input class="form-check-input"
                   @click="pauseResume(channel, $event.target)" type="checkbox"
                   :checked="channel.isPaused===false">
            <label class="form-check-label"> Rec </label>
          </div>
        </td>
        <td class="border-end d-none d-md-table-cell">
          <button v-if="channel.isRecording" class="btn p-1 btn-sm w-100"
                  :class="{'btn-danger': channel.isRecording, 'btn-light': !channel.isRecording}"
                  disabled>
            recording
          </button>
          <button v-else class="btn btn-sm w-100"
                  :class="{'btn-success ': channel.isOnline, 'btn-light' : !channel.isOnline}"
                  disabled>online
          </button>
        </td>
        <td>
          <button class="btn btn-danger w-100" @click="$emit('destroy', channel)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ChannelResponse } from '@/services/api/v1/channelApi';

interface StatusData {
  searchChannel: string;
  baseUrl: string;
}

export default defineComponent({
  name: 'Statuses',
  data(): StatusData {
    return {
      searchChannel: '',
      baseUrl: process.env.VUE_APP_BASE,
    };
  },
  props: {
    statuses: { type: Array, required: true }
  },
  computed: {
    filterStatus(): ChannelResponse[] {
      if (!this.statuses) {
        return [];
      }
      return (this.statuses as ChannelResponse[]).filter(channel => {
        if (this.searchChannel.length > 0) {
          // Match all substrings
          const groups: RegExp[] = this.searchChannel.split(' ').map(s => new RegExp(s, 'i'));
          const matches = groups.map(reg => channel.channelName.match(reg));
          return matches.reduce((a, b) => a && b);
        }
        return true;
      });
    },
  },
  methods: {
    errorLoadImage(element: HTMLImageElement) {
    },
    pauseResume(currentStatus: ChannelResponse, element: HTMLInputElement) {
      // Wait for the change until the actual data changes
      element.checked = !currentStatus.isPaused;

      if (currentStatus.isPaused) {
        this.$emit('resume', currentStatus);
      } else {
        this.$emit('pause', currentStatus);
      }
    },
  },
});
</script>

<style scoped>

</style>
