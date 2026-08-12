<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { projects } from "@/generated/projects";
import { devlogsBySlug } from "@/generated/devlogs";
import DevlogEntryItem from "@/components/DevlogEntry.vue";
import YoutubeEmbed from "@/components/YoutubeEmbed.vue";
import SupportWidget from "@/components/SupportWidget.vue";
import AppIcon from "@/components/AppIcon.vue";
import { usePageHead } from "@/head";

const route = useRoute();
const slug = computed(() => String(route.params.slug));
const project = computed(() => projects.find((p) => p.slug === slug.value));
const entries = computed(() => devlogsBySlug[slug.value] ?? []);

usePageHead({
  title: project.value?.title ?? "Project",
  path: `/projects/${slug.value}`,
  description: project.value?.summary,
});
</script>

<template>
  <div v-if="project" class="flex flex-col gap-6">
    <RouterLink
      to="/projects"
      class="link flex w-fit items-center gap-1 text-sm"
    >
      <AppIcon name="arrow-back" />
      All projects
    </RouterLink>
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-2xl font-bold">{{ project.title }}</h1>
      <span v-if="project.stars !== null" class="badge badge-outline"
        >★ {{ project.stars }}</span
      >
    </div>
    <div v-if="project.tags.length" class="flex flex-wrap gap-2">
      <span v-for="tag in project.tags" :key="tag" class="badge badge-outline">{{
        tag
      }}</span>
    </div>
    <div v-if="project.progress !== undefined" class="flex items-center gap-2">
      <progress
        class="progress progress-primary flex-1"
        :value="project.progress"
        max="100"
      />
      <span class="text-sm opacity-70">{{ project.progress }}%</span>
    </div>
    <p>{{ project.summary }}</p>
    <div class="flex flex-wrap gap-4">
      <a
        v-if="project.repoUrl"
        :href="project.repoUrl"
        target="_blank"
        rel="noopener"
        class="link flex items-center gap-1"
      >
        <AppIcon name="github" />
        Repo
      </a>
      <a
        v-if="project.url"
        :href="project.url"
        target="_blank"
        rel="noopener"
        class="link flex items-center gap-1"
      >
        <AppIcon name="open-in-new" />
        Live
      </a>
    </div>
    <YoutubeEmbed
      v-if="project.videoId"
      :video-id="project.videoId"
      :title="`${project.title} demo video`"
    />
    <div class="prose prose-invert max-w-none" v-html="project.bodyHtml" />
    <div v-if="entries.length" class="flex flex-col gap-6">
      <DevlogEntryItem
        v-for="entry in entries"
        :key="`${entry.date}-${entry.title}`"
        :entry="entry"
      />
    </div>
    <SupportWidget />
  </div>
  <div v-else class="opacity-70">Project not found.</div>
</template>
