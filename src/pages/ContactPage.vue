<script setup lang="ts">
import { summary } from "@/generated/about";
import { contact } from "@/generated/contact";
import { socialLinks } from "@/generated/social";
import AppIcon from "@/components/AppIcon.vue";
import LinkOutCard from "@/components/LinkOutCard.vue";
import { usePageHead } from "@/head";

usePageHead({ title: "Contact", path: "/contact" });
</script>

<template>
  <div class="flex flex-col gap-8">
    <section>
      <h1 class="text-2xl font-bold">{{ summary.name }}</h1>
      <p class="text-primary font-medium">{{ summary.title }}</p>
    </section>

    <section class="flex flex-col gap-3">
      <a
        :href="`mailto:${contact.email}`"
        class="link flex items-center gap-2"
      >
        <AppIcon name="mail" />
        {{ contact.email }}
      </a>
      <a
        v-if="contact.phone"
        :href="`tel:${contact.phone}`"
        class="link flex items-center gap-2"
      >
        <AppIcon name="call" />
        {{ contact.phone }}
      </a>
      <p v-if="contact.location" class="flex items-center gap-2">
        <AppIcon name="location-on" />
        {{ contact.location }}
      </p>
      <a
        v-if="contact.resumeUrl"
        :href="contact.resumeUrl"
        download
        class="link flex items-center gap-2"
      >
        <AppIcon name="download" />
        Download Resume
      </a>
    </section>

    <section v-if="socialLinks.length" class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold">Social</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LinkOutCard
          v-for="social in socialLinks"
          :key="social.url"
          :icon="social.platform"
          :label="social.label"
          :url="social.url"
        />
      </div>
    </section>
  </div>
</template>
