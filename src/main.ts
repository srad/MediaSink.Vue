import { createApp } from 'vue';
import App from './App.vue';
import router from './route';

const app = createApp(App);
app.provide('baseUrl', process.env.VUE_APP_BASE);
app.provide('apiUrl', process.env.VUE_APP_APIURL);
app.use(router);
app.mount('#app');
