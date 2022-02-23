<template>
  <div class="row">
    <div class="col">
      <div class="bg-light border shadow-sm px-3">
        <canvas ref="myChart" width="800" height="400"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
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

export default {
  name: "NetworkChart",
  async mounted() {
    const data = await (await fetch("http://localhost:3000/api/v1/metric/cpu")).json();

    const ctx = this.$refs.myChart.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map(d => new Date(d.createdAt).toLocaleDateString("de-DE", {
          hour: "numeric",
          minute: "numeric",
          day: "numeric",
          month: "numeric",
        })),
        datasets: [
          {
            data: data.filter(c => c.cpu === "cpu").map(d => (d.load * 100).toFixed(2)),
            label: "Transmitted",
            borderColor: "Green",
            fill: false
          },
        ]
      },
      options: {
        title: {
          display: true,
          text: "CPU Load"
        },
        scales: {
          y: {
            min: 0,
            max: 100,
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
  }
};
</script>

<style scoped>
</style>
