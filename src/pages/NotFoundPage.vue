<script setup lang="ts">
import { usePageHead } from "@/head";

usePageHead({ title: "Not Found", path: "/404" });
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-20 text-center">
    <h1 class="text-3xl font-bold">404</h1>
    <p class="opacity-70">Page not found.</p>
    <RouterLink to="/" class="btn btn-primary">Back home</RouterLink>
  </div>
</template>
