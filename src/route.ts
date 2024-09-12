import { createRouter, createWebHistory, createMemoryHistory, RouteRecordRaw } from 'vue-router';
import StreamView from './views/StreamView.vue';
import SortView from './views/SortView.vue';
import BookmarkView from './views/BookmarkView.vue';
import VideoView from './views/VideoView.vue';
import LogView from './views/LogView.vue';
import JobView from './views/JobView.vue';
import AdminView from './views/AdminView.vue';
import LoginView from './views/LoginView.vue';
import LogoutView from './views/LogoutView.vue';
import ChannelView from './views/ChannelView.vue';
import RandomView from './views/RandomView.vue';
import ChannelsView from './views/ChannelsView.vue';

const createHistory = import.meta.env.SSR ? createMemoryHistory : createWebHistory;

const routes: Readonly<RouteRecordRaw[]> = [
  { path: '', redirect: '/streams' },
  { path: '/', redirect: '/streams/live/tab' },
  { path: '/channels', name: 'Channels', component: ChannelsView },
  { path: '/admin', name: 'Admin', component: AdminView },
  { path: '/jobs', name: 'Job', component: JobView },
  { path: '/streams/:tab/tab/:tag?', name: 'Stream', component: StreamView },
  { path: '/channel/:id/:name?', name: 'Channel', component: ChannelView, props: true },
  { path: '/filter', name: 'Filter', component: SortView },
  { path: '/random', name: 'Random', component: RandomView },
  { path: '/recordings/:id', name: 'Video', component: VideoView },
  { path: '/logs', name: 'Log', component: LogView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/logout', name: 'Logout', component: LogoutView },
  { path: '/bookmarks', name: 'Bookmark', component: BookmarkView },
  { path: '/:pathMatch(.*)*', redirect: '/streams/live/tab' },
];

const router = createRouter({ history: createHistory(), routes });

export default router;
