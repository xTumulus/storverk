<script setup lang="ts">
import { socialLinks } from "@/generated/social";
import { links } from "@/generated/links";
import LinkOutCard from "@/components/LinkOutCard.vue";
import { usePageHead } from "@/head";

usePageHead({ title: "Links", path: "/links" });
</script>

<template>
  <div class="flex flex-col gap-8">
    <h1 class="text-2xl font-bold">Links</h1>
    <div v-if="socialLinks.length" class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">Social</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LinkOutCard
          v-for="social in socialLinks"
          :key="social.url"
          :icon="social.platform"
          :label="social.label"
          :url="social.url"
        />
      </div>
    </div>
    <div v-if="links.length" class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">Other Links</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LinkOutCard
          v-for="link in links"
          :key="link.url"
          :icon="link.icon"
          :label="link.label"
          :url="link.url"
          :description="link.description"
        />
      </div>
    </div>
  </div>
</template>
