<script setup lang="ts">
import { home } from "@/generated/home";
import { usePageHead } from "@/head";

usePageHead({ title: "Home", path: "/" });
</script>

<template>
  <div
    class="grid w-full -translate-y-8 gap-10 py-8 md:grid-cols-2 md:items-center"
  >
    <section class="flex flex-col gap-6">
      <h1 class="text-4xl font-bold sm:text-5xl">{{ home.name }}</h1>
      <div class="prose prose-invert max-w-none" v-html="home.bodyHtml" />
      <div class="flex flex-wrap gap-3">
        <template v-for="button in home.buttons" :key="button.label">
          <RouterLink
            v-if="button.to.startsWith('/')"
            :to="button.to"
            :class="[
              'btn',
              button.style === 'primary' ? 'btn-primary' : 'btn-ghost',
            ]"
          >
            {{ button.label }}
          </RouterLink>
          <a
            v-else
            :href="button.to"
            :class="[
              'btn',
              button.style === 'primary' ? 'btn-primary' : 'btn-ghost',
            ]"
          >
            {{ button.label }}
          </a>
        </template>
      </div>
    </section>

    <section class="flex items-center justify-center">
      <img
        v-if="home.image"
        :src="home.image"
        :alt="home.name"
        class="max-h-[42rem] w-auto object-contain"
      />
    </section>
  </div>
</template>
