<script setup lang="ts">
import type { DevlogEntry } from "../../schemas/devlog";
import YoutubeEmbed from "./YoutubeEmbed.vue";

defineProps<{ entry: DevlogEntry }>();
</script>

<template>
  <article class="border-base-300 border-b pb-6 last:border-b-0">
    <div class="mb-2 flex items-baseline gap-3">
      <h3 class="text-lg font-semibold">{{ entry.title }}</h3>
      <time class="text-sm opacity-60">{{ entry.date }}</time>
    </div>
    <div class="prose prose-invert max-w-none" v-html="entry.bodyHtml" />
    <div
      v-if="entry.images.length"
      class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      <img
        v-for="image in entry.images"
        :key="image"
        :src="image"
        class="rounded-box aspect-video w-full object-cover"
      />
    </div>
    <YoutubeEmbed v-if="entry.videoId" :video-id="entry.videoId" class="mt-3" />
  </article>
</template>
