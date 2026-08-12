<script setup lang="ts">
import { projects } from "@/generated/projects";
import ProjectCard from "@/components/ProjectCard.vue";
import SupportWidget from "@/components/SupportWidget.vue";
import { usePageHead } from "@/head";

usePageHead({ title: "Projects", path: "/projects" });
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Projects</h1>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <ProjectCard
        v-for="project in projects"
        :key="project.slug"
        :project="project"
      />
    </div>
    <SupportWidget />
  </div>
</template>
