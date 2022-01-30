import { createRouter, createWebHistory } from 'vue-router';
import Recording from './views/RecordingView.vue';
import Latest from './views/LatestView.vue';
import Bookmark from './views/BookmarkView.vue';
import Video from './views/VideoView.vue';
import Log from './views/LogView.vue';
import JobView from './views/JobView.vue';
import AdminView from './views/AdminView.vue';

const routes = [
  { path: '', redirect: '/streams' },
  { path: '/', redirect: '/streams' },
  { path: '/admin', name: 'Admin', component: AdminView },
  { path: '/jobs', name: 'Job', component: JobView },
  { path: '/streams/:channel?', name: 'Recording', component: Recording, props: true },
  { path: '/gallery/:type/:limit?', name: 'Gallery', component: Latest, props: true },
  { path: '/recordings/:channelName/:filename/:edit?', name: 'Video', component: Video, props: true },
  { path: '/logs', name: 'Log', component: Log },
  { path: '/bookmarks', name: 'Bookmark', component: Bookmark },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
