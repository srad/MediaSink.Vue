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
import { onMounted, ref } from 'vue';

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
import { createClient } from "../../services/api/v1/ClientFactory";

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

const api = createClient();
const myChart = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
  const response = await api.metric.netList();

  const ctx = myChart.value!.getContext("2d");

  const chart = new Chart(ctx!, {
    type: "line",
    data: {
      //labels: response.map(d => new Date(d.createdAt).toLocaleDateString("de-DE", {
      labels: [ response.data ].map(d => new Date(d.createdAt).toLocaleDateString("de-DE", {
        hour: "numeric",
        minute: "numeric",
        day: "numeric",
        month: "numeric",
      })),
      datasets: [
        {
          data: [ response.data ].map(d => (d.transmitBytes / 1024 / 1024).toFixed(2)),
          label: "Transmitted",
          borderColor: "Red",
          fill: false
        },
        {
          data: [ response.data ].map(d => (d.receiveBytes / 1024 / 1024).toFixed(2)),
          label: "Received",
          borderColor: "Blue",
          fill: false
        }
      ]
    },
    options: {
      // title: {
      //   display: true,
      //   text: "World population per region (in millions)"
      // },
      scales: {
        y: {
          min: 0,
          max: 40,
        },
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20
          }
        }
      }
    }
  });
});
</script>

<style scoped>
</style>