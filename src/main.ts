import { createPinia } from "pinia";
import { createApp } from "vue";
import i18n from "./i18n/i18n";
import App from "./App.vue";
import router from "./router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

declare global {
  interface Window {
    APP_APIURL: string;
    APP_BASE: string;
    APP_NAME: string;
    APP_SOCKETURL: string;
    APP_FILEURL: string;
    APP_BUILD: string;
    APP_VERSION: string;
  }
}

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App).use(pinia).use(i18n);

app.provide("appName", window.APP_NAME);
app.provide("baseUrl", window.APP_BASE);
app.provide("apiUrl", window.APP_APIURL);
app.provide("fileUrl", window.APP_FILEURL);
app.provide("socketUrl", window.APP_SOCKETURL);
app.provide("build", window.APP_BUILD);
app.provide("version", window.APP_VERSION);
app.use(router);

app.mount("#app");
