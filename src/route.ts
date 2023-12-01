import { createRouter, createWebHistory } from 'vue-router';
import StreamView from './views/StreamView.vue';
import SortView from './views/SortView.vue';
import BookmarkView from './views/BookmarkView.vue';
import VideoView from './views/VideoView.vue';
import LogView from './views/LogView.vue';
import JobView from './views/JobView.vue';
import AdminView from './views/AdminView.vue';
import LoginView from './views/LoginView.vue';
import LogoutView from './views/LogoutView.vue';
import StreamItemView from './views/StreamItemView.vue';
import RandomView from '@/views/RandomView.vue';

const routes = [
  { path: '', redirect: '/streams' },
  { path: '/', redirect: '/streams/live/tab' },
  { path: '/admin', name: 'Admin', component: AdminView },
  { path: '/jobs', name: 'Job', component: JobView },
  { path: '/streams/:tab/tab/:tag?', name: 'Stream', component: StreamView },
  { path: '/streams/:channel', name: 'StreamItem', component: StreamItemView, props: true },
  { path: '/filter', name: 'Filter', component: SortView },
  { path: '/random', name: 'Random', component: RandomView },
  {
    path: '/recordings/:channelName/:fileName',
    name: 'Video',
    component: VideoView,
    props(route: any) {
      return {
        channelName: route.query.channelName,
        filename: route.query.filename,
        pathRelative: route.query.pathRelative,
        previewStripe: route.query.previewStripe,
      };
    }
  },
  { path: '/logs', name: 'Log', component: LogView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/logout', name: 'Logout', component: LogoutView },
  { path: '/bookmarks', name: 'Bookmark', component: BookmarkView },
  { path: '/:pathMatch(.*)*', redirect: '/streams/live/tab' },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
