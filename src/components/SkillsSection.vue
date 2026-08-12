<script setup lang="ts">
import type { Skill } from "../../schemas/skill";
import CollapsibleSection from "./CollapsibleSection.vue";

defineProps<{ skills: Skill[] }>();
</script>

<template>
  <section v-if="skills.length">
    <CollapsibleSection default-open>
      <template #title>Skills</template>
      <div class="flex flex-col gap-3">
        <div v-for="skill in skills" :key="skill.name">
          <p class="mb-1 font-medium">{{ skill.name }}</p>
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <span
              v-for="detail in skill.details"
              :key="detail"
              class="before:mr-2 before:opacity-60 before:content-['•']"
              >{{ detail }}</span
            >
          </div>
        </div>
      </div>
    </CollapsibleSection>
  </section>
</template>
