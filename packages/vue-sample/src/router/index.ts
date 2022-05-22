import { createRouter, createWebHistory } from "vue-router";

import CallbackView from "../views/CallbackView.vue";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/callback",
      name: "callback",
      component: CallbackView,
    },
    {
      path: "/protected-resource",
      name: "protected-resource",
      component: () => import("../views/ProtectedResourceView.vue"),
    },
  ],
});

export default router;
