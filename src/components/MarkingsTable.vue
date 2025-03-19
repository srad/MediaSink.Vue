<template>
  <div class="table-responsive">
    <table class="table table-sm bg-white table-bordered border-dark table-hover">
      <thead>
      <tr class="align-middle">
        <th class="bg-dark-subtle text-center px-2">{{ t("videoView.segment.start") }}</th>
        <th class="bg-dark-subtle text-center px-2">{{ t("videoView.segment.end") }}</th>
        <th class="bg-dark-subtle text-center px-2">{{ t("videoView.segment.duration") }}</th>
        <th class="bg-dark-subtle text-center px-2" v-if="showDestroy">
          <button @click="destroyAll" class="btn btn-sm bg-transparent">
            <i class="bi bi-trash3 text-danger"></i>
          </button>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(overview, i) in markingsOverview" :key="`${overview.marking.timestart}${overview.marking.timeend}`"
          style="cursor:pointer !important;"
          class="align-middle"
          :class="{'bg-secondary': overview.marking.selected}"
          @click="() => { selectedIndex= i; emit('selected', overview.marking); }">
        <td class="px-2 text-center py-1" :class="{'bg-warning': selectedIndex === i}">{{ overview.start }}</td>
        <td class=" px-2 text-center py-1" :class="{'bg-warning': selectedIndex === i}">{{ overview.end }}</td>
        <td class=" px-2 text-center py-1" :class="{'bg-warning': selectedIndex === i}">{{ overview.duration }}</td>
        <td class="text-center p-0" v-if="showDestroy" :class="{'bg-warning': selectedIndex === i}">
          <button @click="destroy(overview.marking, i)" class="btn btn-sm bg-transparent">
            <i class="bi bi-trash3 text-danger"></i>
          </button>
        </td>
      </tr>
      <tr class="bg-danger-subtle">
        <td colspan="2" class="px-2 fw-bold bg-transparent">Total (min)</td>
        <td class="px-2 fw-bold text-center bg-transparent">{{ markingsDuration }}</td>
        <td class="px-2 fw-bold text-center bg-transparent" v-if="showDestroy"></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import type { Marking } from "../types/appTypes.ts";
import { useI18n } from "vue-i18n";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { t } = useI18n();

const selectedIndex = ref(-1);

const emit = defineEmits<{
  (e: "selected", value: Marking): void
  (e: "destroy", value: Marking): void
  (e: "destroyAll"): void
}>();

const props = defineProps<{ markings: Marking[], showDestroy: boolean }>();

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const destroy = (markings: Marking, index: number) => {
  emit("destroy", markings);

  // Reset row highlighting.
  if (selectedIndex.value === index) {
    selectedIndex.value = -1;
  }
};

const destroyAll = () => {
  emit("destroyAll");
  selectedIndex.value = -1;
};

const secondsToTimeCode = (seconds: number) => {
  const date = new Date(0);
  date.setSeconds(seconds);

  const s = date.toISOString().substring(11, 19);

  if (s.startsWith("00:0")) {
    return s.substring(4);
  }

  if (s.startsWith("00:")) {
    return s.substring(3);
  }

  return s;
};

const markingsOverview = computed(() => {
  return props.markings.slice().sort((a, b) => a.timestart - b.timestart).map(x => {
    return {
      marking: x,
      start: secondsToTimeCode(x.timestart),
      end: secondsToTimeCode(x.timeend),
      duration: secondsToTimeCode(x.timeend - x.timestart),
    };
  });
});

const markingsDuration = computed(() => {
  const totalSeconds = props.markings.reduce((acc, current) => acc + (current.timeend - current.timestart), 0);

  return secondsToTimeCode(totalSeconds);
});

</script>
