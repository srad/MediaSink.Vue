import { renderToString } from "vue/server-renderer";
import { createSSRApp } from "vue";
import { i18n } from "./i18n/i18n";
import App from "./App.vue";
import router from "./route";
import { store, key } from "./store";

const app = createSSRApp(App).use(i18n)
  .use(store, key)
  .use(i18n);

app.provide("appName", import.meta.env.VITE_VUE_APP_NAME);
app.provide("baseUrl", import.meta.env.VITE_VUE_APP_BASE);
app.provide("apiUrl", import.meta.env.VITE_VUE_APP_APIURL);
app.provide("fileUrl", import.meta.env.VITE_VUE_APP_FILEURL);
app.provide("socketUrl", import.meta.env.VITE_VUE_APP_SOCKETURL);
app.provide("build", import.meta.env.VITE_VUE_APP_BUILD);
app.provide("version", import.meta.env.VITE_VUE_APP_VERSION);

app.use(router);

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => app.mount("#app"));

export async function render() {
  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {};
  const html = await renderToString(app, ctx);

  return { html };
}