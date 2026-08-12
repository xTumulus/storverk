<script setup lang="ts">
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";

defineProps<{ videoId: string; title?: string }>();

// Lazy-loaded: no iframe (and no YouTube network/cookie activity) until the
// visitor actually clicks play.
const isPlaying = ref(false);
</script>

<template>
  <div
    class="rounded-box relative aspect-video w-full overflow-hidden bg-neutral"
  >
    <iframe
      v-if="isPlaying"
      class="h-full w-full"
      :src="`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`"
      title="YouTube video player"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
      "
      allowfullscreen
    />
    <button
      v-else
      type="button"
      class="group relative h-full w-full"
      @click="isPlaying = true"
    >
      <img
        :src="`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`"
        :alt="title ?? 'Video thumbnail'"
        class="h-full w-full object-cover"
      />
      <span
        class="absolute inset-0 flex items-center justify-center bg-neutral/30 text-neutral-content transition-colors group-hover:bg-neutral/50"
      >
        <AppIcon name="play-circle" class="text-6xl" />
      </span>
    </button>
  </div>
</template>
