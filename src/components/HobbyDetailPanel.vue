<script setup lang="ts">
import type { Hobby } from "../../schemas/hobby";

defineProps<{ hobby: Hobby }>();
</script>

<template>
  <div class="bg-base-200 border-base-300 rounded-box border p-4">
    <h2 class="mb-2 text-lg font-semibold">{{ hobby.label }}</h2>
    <div
      v-if="hobby.bodyHtml"
      class="prose prose-invert max-w-none"
      v-html="hobby.bodyHtml"
    />
    <p v-else class="opacity-70">No details yet.</p>
  </div>
</template>
