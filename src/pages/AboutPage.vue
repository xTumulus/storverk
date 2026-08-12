<script setup lang="ts">
import {
  summary,
  skills,
  education,
  experience,
  credentials,
  volunteer,
  languages,
} from "@/generated/about";
import AppIcon from "@/components/AppIcon.vue";
import SkillsSection from "@/components/SkillsSection.vue";
import EducationBlock from "@/components/EducationBlock.vue";
import CollapsibleList from "@/components/CollapsibleList.vue";
import CollapsibleSection from "@/components/CollapsibleSection.vue";
import LlmSlot from "@/components/LlmSlot.vue";
import { usePageHead } from "@/head";

usePageHead({ title: "About", path: "/about" });

function formatRange(startDate: string, endDate: string | null) {
  return `${startDate} – ${endDate ?? "Present"}`;
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <section>
      <h1 class="text-2xl font-bold">{{ summary.name }}</h1>
      <p class="text-primary mb-4 font-medium">{{ summary.title }}</p>
      <div class="prose prose-invert max-w-none" v-html="summary.bodyHtml" />
    </section>

    <SkillsSection :skills="skills" />

    <EducationBlock :entries="education" />

    <section v-if="experience.length">
      <h2 class="mb-3 flex items-center gap-2 text-xl font-semibold">
        <AppIcon name="work" />
        Experience
      </h2>
      <CollapsibleList :items="experience">
        <template #title="{ item }">
          <div>
            <span class="font-medium">{{ item.company }}</span>
            <span class="opacity-70"> — {{ item.title }}</span>
            <div class="text-sm opacity-60">
              {{ formatRange(item.startDate, item.endDate) }}
            </div>
          </div>
        </template>
        <template #default="{ item }">
          <p class="mb-2">{{ item.summary }}</p>
          <ul class="flex list-outside list-disc flex-col gap-1 pl-5">
            <li v-for="highlight in item.highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </template>
      </CollapsibleList>
    </section>

    <section v-if="credentials.length">
      <CollapsibleSection default-open>
        <template #title>
          <span class="inline-flex items-center gap-2">
            <AppIcon name="military-tech" />
            Credentials
          </span>
        </template>
        <div class="flex flex-col gap-3">
          <div v-for="item in credentials" :key="item.name">
            <span class="font-medium">{{ item.name }}</span>
            <div class="text-sm opacity-60">
              {{ item.issuer }} · {{ item.date }}
            </div>
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener"
              class="link"
            >
              View credential
            </a>
          </div>
        </div>
      </CollapsibleSection>
    </section>

    <section v-if="volunteer.length">
      <CollapsibleSection default-open>
        <template #title>
          <span class="inline-flex items-center gap-2">
            <AppIcon name="volunteer-activism" />
            Volunteer Experience
          </span>
        </template>
        <div class="flex flex-col gap-3">
          <div v-for="item in volunteer" :key="item.organization">
            <span class="font-medium">{{ item.organization }}</span>
            <span class="opacity-70"> — {{ item.role }}</span>
            <div class="text-sm opacity-60">
              {{ formatRange(item.startDate, item.endDate) }}
            </div>
            <p class="mt-1">{{ item.summary }}</p>
          </div>
        </div>
      </CollapsibleSection>
    </section>

    <section v-if="languages.length">
      <CollapsibleSection default-open>
        <template #title>
          <span class="inline-flex items-center gap-2">
            <AppIcon name="language" />
            Languages
          </span>
        </template>
        <div class="flex flex-col gap-1">
          <div v-for="item in languages" :key="item.name">
            <span class="font-medium">{{ item.name }}</span>
            <span class="opacity-70"> — {{ item.proficiency }}</span>
          </div>
        </div>
      </CollapsibleSection>
    </section>

    <LlmSlot />
  </div>
</template>
