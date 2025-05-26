import { createRouter, createWebHistory } from "vue-router";
import StreamView from "../views/StreamsView.vue";
import FilterView from "../views/FilterView.vue";
import BookmarkView from "../views/BookmarksView.vue";
import VideoView from "../views/VideoView.vue";
import LogView from "../views/LogsView.vue";
import JobView from "../views/JobView.vue";
import AdminView from "../views/AdminView.vue";
import RandomView from "../views/RandomView.vue";
import ChannelView from "@/views/ChannelView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import { useAuthStore } from "../stores/auth";
import ChannelsView from "../views/ChannelsView.vue";
import InfoView from "@/views/InfoView.vue";
import MonitoringView from "@/views/MonitoringView.vue";

const routes = [
  { path: "", redirect: "/streams" },
  { path: "/", redirect: "/streams/live/tab" },
  { path: "/login", name: "Login", component: LoginView, meta: { title: "Login", layout: "auth" } },
  { path: "/register", name: "Register", component: RegisterView, meta: { title: "Register", layout: "auth" } },
  {
    path: "/channel/:id/:channelName",
    name: "Channel",
    component: ChannelView,
    props: true,
    meta: { title: "Channel" },
  },
  { path: "/channels", name: "Channels", component: ChannelsView, meta: { title: "Channels" } },
  { path: "/admin", name: "Admin", component: AdminView, meta: { title: "Admin" } },
  { path: "/info", name: "Info", component: InfoView, meta: { title: "Info" } },
  { path: "/monitoring", name: "Monitoring", component: MonitoringView, meta: { title: "Monitoring" } },

  { path: "/jobs", redirect: "/jobs/open" },
  { path: "/jobs/:tab", name: "Job", component: JobView, meta: { title: "Jobs" } },
  {
    path: "/streams/:tab/tab/:tag?",
    name: "Streams",
    component: StreamView,
    meta: { title: "Stream" },
  },
  { path: "/filter", name: "Filter", component: FilterView, meta: { title: "Latest" } },
  { path: "/random", name: "Random", component: RandomView, meta: { title: "Random" } },
  { path: "/recordings/:id", name: "Video", component: VideoView, meta: { layout: "fullscreen" } },
  { path: "/logs", name: "Log", component: LogView, meta: { title: "Logs" } },
  { path: "/bookmarks", name: "Bookmark", component: BookmarkView, meta: { title: "Favourites" } },
  { path: "/:pathMatch(.*)*", redirect: "/streams/live/tab" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const contentElement = document.querySelector("body");
        if (contentElement) {
          contentElement.scrollTo({ top: 0, behavior: "instant" });
        }
        resolve(savedPosition || { top: 0 });
      }, 100); // Small delay to ensure the content has loaded
    });
  },
});

router.afterEach((to) => {
  //@ts-expect-error Vue nonsense error
  document.title = to.meta.title || "StreamSink";
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const publicPages = ["/login", "/register"];
  const isLoggedIn = authStore.isLoggedIn;

  if (!isLoggedIn && publicPages.includes(to.path)) {
    next();
    return;
  }

  if (isLoggedIn && publicPages.includes(to.path)) {
    next("/");
    return;
  }

  next();
});

export default router;
