<script setup lang="ts">
import type { Project } from "../../schemas/project";

defineProps<{ project: Project }>();
</script>

<template>
  <RouterLink
    :to="`/projects/${project.slug}`"
    class="card bg-base-200 border-base-300 hover:border-primary border transition-colors"
  >
    <figure v-if="project.thumbnail" class="aspect-video overflow-hidden">
      <img
        :src="project.thumbnail"
        :alt="project.title"
        class="h-full w-full object-contain"
      />
    </figure>
    <div class="card-body gap-2">
      <div class="flex items-center justify-between gap-2">
        <h2 class="card-title">{{ project.title }}</h2>
        <span v-if="project.stars !== null" class="badge badge-outline"
          >★ {{ project.stars }}</span
        >
      </div>
      <p>{{ project.summary }}</p>
      <div v-if="project.tags.length" class="flex flex-wrap gap-2">
        <span
          v-for="tag in project.tags"
          :key="tag"
          class="badge badge-outline"
          >{{ tag }}</span
        >
      </div>
      <div v-if="project.progress !== undefined" class="flex items-center gap-2">
        <progress
          class="progress progress-primary flex-1"
          :value="project.progress"
          max="100"
        />
        <span class="text-sm opacity-70">{{ project.progress }}%</span>
      </div>
      <p v-if="project.latestDevlog" class="text-sm opacity-70">
        Latest ({{ project.latestDevlog.date }}):
        {{ project.latestDevlog.excerpt }}
      </p>
    </div>
  </RouterLink>
</template>
