<script setup lang="ts">
import { computed } from "vue";
import { iconRegistry, type IconName } from "./icon-registry";

// Accepts a plain string (not just IconName) because some icon names come
// from content files (e.g. `social.yaml`'s `platform` field) and aren't
// known at compile time. Unregistered names render nothing, with a dev-only
// warning, rather than breaking the build.
const props = defineProps<{ name: IconName | (string & {}) }>();

const markup = computed(() => {
  const svg = iconRegistry[props.name as IconName];
  if (!svg && import.meta.env.DEV) {
    console.warn(`AppIcon: unknown icon name "${props.name}"`);
  }
  return svg ?? "";
});
</script>

<template>
  <span class="app-icon" aria-hidden="true" v-html="markup" />
</template>

<style scoped>
.app-icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  flex: none;
}

.app-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
