<template>
  <div class="row">
    <div class="col">
      <div class="bg-light border shadow-sm px-3">
        <canvas ref="myChart" width="800" height="400"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from "chart.js";

import { createClient } from '../../services/api/v1/ClientFactory';
import { onMounted, ref } from "vue";

Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
);

const myChart = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
  // const api = createClient();
  // const response = await api.metric.cpuList();
  //
  // const ctx = myChart.value!.getContext("2d");
  //
  // const chart = new Chart(ctx!, {
  //   type: "line",
  //   data: {
  //     labels: [ response.data ].map(d => new Date(d.createdAt).toLocaleDateString("de-DE", {
  //       hour: "numeric",
  //       minute: "numeric",
  //       day: "numeric",
  //       month: "numeric",
  //     })),
  //     datasets: [
  //       {
  //         data: [ response.data ].filter(c => c.cpu === "cpu").map(d => (d.load * 100).toFixed(2)),
  //         label: "Transmitted",
  //         borderColor: "Green",
  //         fill: false
  //       },
  //     ]
  //   },
  //   options: {
  //     // title: {
  //     //   display: true,
  //     //   text: "CPU Load"
  //     // },
  //     scales: {
  //       y: {
  //         min: 0,
  //         max: 100,
  //       },
  //       x: {
  //         ticks: {
  //           autoSkip: true,
  //           maxTicksLimit: 20
  //         }
  //       }
  //     }
  //   }
  // });
});
</script>

<style scoped>
</style>
