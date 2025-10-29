import { createRouter, createWebHistory } from "vue-router";
import { defineAsyncComponent } from "vue";
import { useAuthStore } from "../stores/auth";

// Lazy load views with code splitting for better performance
// Login/Register load eagerly since they're shown first
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import RouteLoadingIndicator from "../components/RouteLoadingIndicator.vue";
import StreamsView from "../views/StreamsView.vue";

// Configure async component loading with loading indicator
const asyncComponentConfig = {
  loadingComponent: RouteLoadingIndicator,
  delay: 200, // Show loading indicator after 200ms
  timeout: 10000, // Timeout after 10 seconds
};

const FilterView = defineAsyncComponent({
  loader: () => import("../views/FilterView.vue"),
  ...asyncComponentConfig,
});
const BookmarkView = defineAsyncComponent({
  loader: () => import("../views/BookmarksView.vue"),
  ...asyncComponentConfig,
});
const VideoView = defineAsyncComponent({
  loader: () => import("../views/VideoView.vue"),
  ...asyncComponentConfig,
});
const LogView = defineAsyncComponent({
  loader: () => import("../views/LogsView.vue"),
  ...asyncComponentConfig,
});
const JobView = defineAsyncComponent({
  loader: () => import("../views/JobView.vue"),
  ...asyncComponentConfig,
});
const AdminView = defineAsyncComponent({
  loader: () => import("../views/AdminView.vue"),
  ...asyncComponentConfig,
});
const RandomView = defineAsyncComponent({
  loader: () => import("../views/RandomView.vue"),
  ...asyncComponentConfig,
});
const ChannelView = defineAsyncComponent({
  loader: () => import("@/views/ChannelView.vue"),
  ...asyncComponentConfig,
});
const ChannelsView = defineAsyncComponent({
  loader: () => import("../views/ChannelsView.vue"),
  ...asyncComponentConfig,
});
const InfoView = defineAsyncComponent({
  loader: () => import("@/views/InfoView.vue"),
  ...asyncComponentConfig,
});
const MonitoringView = defineAsyncComponent({
  loader: () => import("@/views/MonitoringView.vue"),
  ...asyncComponentConfig,
});

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
    component: StreamsView,
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
  const isPublicPage = publicPages.includes(to.path);

  // If not logged in and trying to access protected page, redirect to login
  if (!isLoggedIn && !isPublicPage) {
    next("/login");
    return;
  }

  // If logged in and trying to access public page (login/register), redirect to home
  if (isLoggedIn && isPublicPage) {
    next("/");
    return;
  }

  // Allow navigation
  next();
});

export default router;
