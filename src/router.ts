import type { RouterOptions } from "vite-ssg";

export const routerOptions: RouterOptions = {
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("./pages/HomePage.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("./pages/AboutPage.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("./pages/ContactPage.vue"),
    },
    {
      path: "/projects",
      name: "projects",
      component: () => import("./pages/ProjectsPage.vue"),
    },
    {
      path: "/projects/:slug",
      name: "project-detail",
      component: () => import("./pages/ProjectDetailPage.vue"),
    },
    {
      path: "/links",
      name: "links",
      component: () => import("./pages/LinksPage.vue"),
    },
    {
      path: "/hobbies",
      name: "hobbies",
      component: () => import("./pages/HobbiesPage.vue"),
    },
    {
      // A concrete path (as opposed to the catch-all below) so vite-ssg
      // prerenders it as a real dist/404.html — nginx serves that file for
      // any unmatched request (see docker/nginx.conf's error_page directive).
      path: "/404",
      name: "not-found",
      component: () => import("./pages/NotFoundPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "catch-all",
      component: () => import("./pages/NotFoundPage.vue"),
    },
  ],
};
