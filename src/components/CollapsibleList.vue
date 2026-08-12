<script setup lang="ts" generic="T">
import CollapsibleSection from "./CollapsibleSection.vue";

defineProps<{ items: T[] }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <CollapsibleSection v-for="(item, index) in items" :key="index">
      <template #title>
        <slot name="title" :item="item" />
      </template>
      <slot :item="item" />
    </CollapsibleSection>
  </div>
</template>
