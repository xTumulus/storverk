<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import type { IconName } from "@/components/icon-registry";
import { siteConfig } from "@/generated/site-config";

const navItems: { label: string; to: string; icon: IconName }[] = [
  { label: "Home", to: "/", icon: "home" },
  { label: "About", to: "/about", icon: "person" },
  { label: "Projects", to: "/projects", icon: "deployed-code" },
  { label: "Links", to: "/links", icon: "link" },
  { label: "Hobbies", to: "/hobbies", icon: "interests" },
  { label: "Contact", to: "/contact", icon: "mail" },
];

const route = useRoute();
const isHome = computed(() => route.path === "/");
</script>

<template>
  <div
    class="bg-linear-to-l from-primary/20 via-primary/5 via-15% to-transparent to-35% flex min-h-screen flex-col"
    v-bind="{ 'data-theme': siteConfig.theme.daisyTheme }"
  >
    <header
      class="navbar bg-base-200 border-b border-base-300 px-6 sm:px-8 lg:px-12"
    >
      <div class="flex w-full items-center justify-between gap-4">
        <RouterLink to="/" class="text-lg font-semibold whitespace-nowrap">
          {{ siteConfig.site.name }}
        </RouterLink>
        <nav class="flex gap-1 overflow-x-auto">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="btn btn-ghost btn-sm flex-none gap-1"
            active-class="btn-active"
          >
            <AppIcon :name="item.icon" class="text-base" />
            <span class="hidden sm:inline">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <main
      :class="
        isHome
          ? 'flex w-full flex-1 flex-col justify-center px-[10%] py-8'
          : 'mx-auto w-full max-w-5xl flex-1 px-4 py-8'
      "
    >
      <slot />
    </main>
  </div>
</template>
