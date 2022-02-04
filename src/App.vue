<template>
  <main>
    <nav class="navbar navbar-expand-lg sticky-top shadow-sm m-0 d-flex bg-primary justify-content-between">
      <div class="container-fluid">
        <a class="navbar-brand d-none d-lg-block text-white fw-bold" href="/streams">
          <span class="d-none d-lg-inline p-2">{{ title }}</span>
          <i class="bi bi-water" style="color: deepskyblue"></i>
        </a>

        <div class="navbar-collapse collapse px-2 mb-1" :class="{'d-none': collapseNav}" id="collapsibleNavbar">
          <ul class="navbar-nav">
            <li class="nav-item" v-for="link in links" :key="link">
              <router-link :to="link.url" :custom="true" exact-active-class="active" v-slot="{ navigate, href, isActive }">
                <a :href="href" :class="{active: isActive}" @click="navigate" class="nav-link text-white">
                  {{ link.title }}
                </a>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="btn-group">
          <button class="btn btn-info text-white" @click="showAddChannelModal">
            Add Channel
          </button>
          <button v-if="!recording" class="btn btn-success" @click="record(true)">
            <i class="bi bi-record-fill"></i>
            start
          </button>
          <button v-else class="btn btn-danger blink" @click="record(false)">
            <i class="bi bi-stop-fill"></i>
            stop
          </button>
        </div>

        <button class="text-white fs-1 navbar-toggler collapsed" type="button" data-bs-toggle="collapse" @click="toggle" data-bs-target="#collapsibleNavbar" style="cursor:pointer" aria-expanded="false">
          <span class="bi bi-list"></span>
        </button>
      </div>
    </nav>
    <div class="container-fluid py-3">
      <router-view v-slot="{ Component }">
        <!--<keep-alive include="[StatusView,RecordingView,BookmarkView,LogView,VideoView]">-->
        <component :is="Component"/>
        <!--</keep-alive>-->
      </router-view>
    </div>

    <div class="modal fade border-primary" ref="addChannelModal" aria-hidden="true" aria-labelledby="exampleModalToggleLabel2" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="exampleModalToggleLabel2">Add Stream</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="url" class="form-label fw-bold">URL</label>
              <div class="input-group mb-3">
                <input type="url" autocomplete="off" ref="url" class="form-control" id="url" v-model="url" @input="recommendChannelName">
                <button class="btn btn-outline-secondary" type="button" id="button-addon1" @click="paste">
                  Paste
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label for="channel" class="form-label fw-bold">Channel name</label>
              <input type="text" autocomplete="off" class="form-control" id="channel" v-model="channelName">
              <div class="fs-6 my-2">Only <span class="badge bg-info">a-z</span> and
                <span class="badge bg-info">_</span> allowed.
                This will also be the parent folder name for all recordings of this service.
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button class="btn btn-primary" @click="save">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
//import socket from "./socket";
import { ChannelApi } from './services/api/v1/channelApi';
import { RecordingApi } from './services/api/v1/recordingApi';
import { Modal } from 'bootstrap';
import { defineComponent } from 'vue';

//import event from "./services/event";

const channel = new ChannelApi();
const recording = new RecordingApi();

const channelParser = /^[a-z_0-9]+$/i;

interface AppData {
  title: string;
  modal?: Modal;
  channelName: string;
  url: string;
  shown: boolean;
  recording: boolean;
  online: boolean;
  collapseNav: boolean;
  links: { url: string, title: string }[];
}

export default defineComponent({
  name: 'App',
  inject: ['socketUrl'],
  data(): AppData {
    return {
      title: process.env.VUE_APP_NAME,
      modal: undefined,
      channelName: '',
      url: '',
      shown: true,
      recording: false,
      online: false,
      collapseNav: true,
      links: [
        { url: '/streams', title: 'Streams' },
        { url: '/gallery/latest', title: 'Latest' },
        { url: '/gallery/random', title: 'Random' },
        { url: '/favs', title: 'Favs' },
        { url: '/jobs', title: 'Jobs' },
        { url: '/admin', title: 'Admin' }
      ]
    };
  },
  watch: {
    $route() {
      this.collapseNav = true;
    }
  },
  methods: {
    async paste() {
      this.url = await navigator.clipboard.readText();
      this.recommendChannelName();
    },
    recommendChannelName() {
      const find = this.url.toLowerCase()
          .split('/')
          .find(s => channelParser.test(s));

      if (find) {
        this.channelName = find;
      }
    },
    toggle() {
      this.collapseNav = !this.collapseNav;
    },
    showAddChannelModal() {
      this.channelName = '';
      this.url = '';
      this.modal?.show();
      (this.$refs.url as HTMLInputElement).focus();
    },
    async save() {
      if (/[a-z_]+/i.test(this.channelName)) {
        channel.add({ channelName: this.channelName, url: this.url })
            .then(res => {
              this.modal?.hide();
              this.$store.commit('addChannel', res.data);
              // TODO: vuex add global channel data
            })
            .catch((err: Error) => alert(err));
      }
    },
    record(resume: boolean) {
      if (resume) {
        if (window.confirm('Start recording?')) {
          recording.resume().then(() => {
            this.recording = true;
          }).catch(err => {
            alert(err);
          });
        }
      } else {
        if (window.confirm('Do you want to stop all recordings?')) {
          recording.pause().then(() => {
            this.$store.commit('stopChannels');
            this.recording = false;
          }).catch(err => {
            alert(err);
          });
        }
      }
    },

  },
  mounted() {
    this.modal = new Modal(this.$refs.addChannelModal as HTMLElement);

    recording.isRecording().then(res => {
      this.recording = res.data;
    });

    //   //@ts-ignore
    //   const c = new WebSocket(this.socketUrl);
    //
    //   // const send = function (data: any) {
    //   //   console.log('Send: ', data);
    //   //   c.send(data);
    //   // };
    //
    //   c.onmessage = function (msg: any) {
    //     console.log('Received', msg);
    //   };
    //
    //   c.onopen = function () {
    //     console.log('open ws');
    //   };
    // });

    // socket.on(event.system.metrics, data => {
    //   this.cpu = data.cpu;
    //   this.uptime = data.uptime;
    //   this.memTotal = data.mem.totalMemMb;
    //   this.memUsed = data.mem.usedMemMb;
    //   this.netInput = data.net.speed.receiveBytes;
    //   this.netOutput = data.net.speed.transmitBytes;
    //   this.netInTraffic = data.net.volume.receiveTotalBytes;
    //   this.netOutTraffic = data.net.volume.transmitTotalBytes;
    //   this.diskUsed = data.disk.used;
    //   this.diskTotal = data.disk.total;
    // });

    // socket.on(event.stream.start, text => {
    //   this.log += text + "\n";
    // });
    //
    // socket.on(event.stream.end, data => {
    //   this.log += data.message + "\n";
    // });
    //
    // socket.on(event.stream.preview, data => {
    //   this.log += data.message + "\n";
    // });
    //
    // socket.on(event.notify, message => {
    //   alert(message);
    // });
    //
    // socket.on("start-all", () => {
    //   this.recording = true;
    // });
    //
    // socket.on("stop-all", () => {
    //   this.recording = false;
    // });
  },
});
</script>

<style lang="scss">
@import "./assets/main.scss";

video.view {
  height: 100%;
  width: 100%;
  max-height: 100%
}

video.edit {
  height: 90%;
  width: 100%;
  max-height: 90%
}
</style>
