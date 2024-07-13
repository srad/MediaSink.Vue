import { createApp } from 'vue';
import { i18n } from './i18n/i18n';
import App from './App.vue';
import router from './route';
import { store, key } from "./store";

// The whole point of this is to allow docker runtime environment variables.
// See also: docker-entrypoint.sh
export {};
declare global {
  interface Window {
    VUE_APP_APIURL: string;
    VUE_APP_BASE: string;
    VUE_APP_NAME: string;
    VUE_APP_SOCKETURL: string;
    VUE_APP_FILEURL: string;
    VUE_APP_BUILD: string;
  }
}

const app = createApp(App).use(i18n)
  .use(store, key)
  .use(i18n);

app.provide('baseUrl', window.VUE_APP_BASE);
app.provide('apiUrl', window.VUE_APP_APIURL);
app.provide('fileUrl', window.VUE_APP_FILEURL);
app.provide('socketUrl', window.VUE_APP_SOCKETURL);
app.provide('build', window.VUE_APP_BUILD);
app.use(router);

app.mount('#app');