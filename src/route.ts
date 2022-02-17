import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import StreamView from './views/StreamView.vue';
import LatestView from './views/LatestView.vue';
import BookmarkView from './views/BookmarkView.vue';
import VideoView from './views/VideoView.vue';
import LogView from './views/LogView.vue';
import JobView from './views/JobView.vue';
import AdminView from './views/AdminView.vue';
import LoginView from './views/LoginView.vue';
import LogoutView from './views/LogoutView.vue';
import StreamItemView from './views/StreamItemView.vue';

const routes = [
  { path: '', redirect: '/streams' },
  { path: '/', redirect: '/streams/live/tab' },
  { path: '/admin', name: 'Admin', component: AdminView },
  { path: '/jobs', name: 'Job', component: JobView },
  { path: '/streams/:tab/tab/:tag?', name: 'Stream', component: StreamView },
  { path: '/streams/:channel', name: 'StreamItem', component: StreamItemView, props: true },
  { path: '/gallery/:type', name: 'Gallery', component: LatestView },
  { path: '/recordings/:channelName/:filename', name: 'Video', component: VideoView, props: true },
  { path: '/logs', name: 'Log', component: LogView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/logout', name: 'Logout', component: LogoutView },
  { path: '/favs', name: 'Bookmark', component: BookmarkView },
  { path: '/:pathMatch(.*)*', redirect: '/streams/live/tab' },
];

const router = createRouter({ history: createWebHashHistory(), routes });
export default router;
