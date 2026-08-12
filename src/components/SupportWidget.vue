<script setup lang="ts">
import { siteConfig } from "@/generated/site-config";
import AppIcon from "./AppIcon.vue";

// Deliberately NOT mounted in DefaultLayout — only the Active Projects pages
// include this component, per the brainstorm decision to keep it scoped
// there rather than site-wide.
const platformLabels: Record<string, string> = {
  buymeacoffee: "Buy Me a Coffee",
  patreon: "Patreon",
  kofi: "Ko-fi",
  githubsponsors: "GitHub Sponsors",
};
</script>

<template>
  <div
    v-if="siteConfig.support.platforms.length"
    class="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2"
  >
    <a
      v-for="platform in siteConfig.support.platforms"
      :key="platform.type"
      :href="platform.url"
      target="_blank"
      rel="noopener"
      class="btn btn-primary btn-sm gap-2"
    >
      <AppIcon :name="platform.type" />
      {{ platformLabels[platform.type] ?? platform.type }}
    </a>
  </div>
</template>
