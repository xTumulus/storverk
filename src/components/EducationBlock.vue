<script setup lang="ts">
import type { EducationEntry } from "../../schemas/education";
import AppIcon from "./AppIcon.vue";

defineProps<{ entries: EducationEntry[] }>();
</script>

<template>
  <section v-if="entries.length" class="flex flex-col gap-3">
    <h2 class="flex items-center gap-2 text-xl font-semibold">
      <AppIcon name="school" />
      Education
    </h2>
    <div
      v-for="entry in entries"
      :key="entry.school"
      class="flex items-center gap-4"
    >
      <img
        v-if="entry.photo"
        :src="entry.photo"
        :alt="`${entry.school} photo`"
        class="h-16 w-16 flex-none rounded-full object-cover"
      />
      <div>
        <p class="font-medium">{{ entry.degree }}</p>
        <p class="text-sm opacity-70">{{ entry.school }}, {{ entry.year }}</p>
      </div>
    </div>
  </section>
</template>
