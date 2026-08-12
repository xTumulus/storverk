<script setup lang="ts">
import { siteConfig } from "@/generated/site-config";

// Deferred feature (see project plan): deliberately a no-op unless enabled.
// Flipping `llm.enabled` in site.config.yaml should never require touching
// any other component.
</script>

<template>
  <div v-if="siteConfig.llm.enabled" class="alert">
    <span>LLM career assistant placeholder — not yet implemented.</span>
  </div>
</template>
