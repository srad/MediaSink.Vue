<template>
  <textarea disabled class="form-control vh-100 w-100" v-model="log"></textarea>
</template>

<script>
//import socket from "@/socket";
//import event from "@/services/event";

export default {
  data() {
    return {
      log: ""
    };
  },
  created() {
    //socket.on("log", (text) => {
    //  this.log += text + "\n";
    //});
  }
};
</script>

<style scoped></style>
