import { createApp } from 'vue';
import App from './App.vue';
import router from './route';
import { store } from './store/index';
import { i18n } from '@/i18n/i18n';

const app = createApp(App).use(store);
app.provide('baseUrl', process.env.VUE_APP_BASE);
app.provide('apiUrl', process.env.VUE_APP_APIURL);
app.provide('fileUrl', process.env.VUE_APP_FILEURL);
app.provide('socketUrl', process.env.VUE_APP_SOCKETURL);
app.use(router);
app.use(i18n);

app.mount('#app');
