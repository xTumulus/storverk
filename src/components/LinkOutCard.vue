<script setup lang="ts">
import AppIcon from "./AppIcon.vue";

defineProps<{
  icon: string;
  label: string;
  url: string;
  description?: string;
}>();
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener"
    class="card bg-base-200 border-base-300 hover:border-primary border transition-colors"
  >
    <div class="card-body flex-row items-center gap-4 py-4">
      <AppIcon :name="icon" class="flex-none text-2xl" />
      <div>
        <p class="font-medium">{{ label }}</p>
        <p v-if="description" class="text-sm opacity-70">{{ description }}</p>
      </div>
    </div>
  </a>
</template>
