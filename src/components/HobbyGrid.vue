<script setup lang="ts">
import { reactive } from "vue";
import type { Hobby } from "../../schemas/hobby";
import AppIcon from "./AppIcon.vue";

defineProps<{ hobbies: Hobby[]; selectedId: string | null }>();
const emit = defineEmits<{ select: [id: string] }>();

// Per-id, so one hobby's image failing to load never affects any other's.
const failedImageIds = reactive(new Set<string>());

function handleImageError(hobby: Hobby) {
  failedImageIds.add(hobby.id);
  console.error(`Failed to load hobby image "${hobby.image}" for "${hobby.id}"`);
}
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <button
      v-for="hobby in hobbies"
      :key="hobby.id"
      type="button"
      class="card bg-base-200 border-base-300 hover:border-primary border transition-colors"
      :class="{ 'border-primary': selectedId === hobby.id }"
      @click="emit('select', hobby.id)"
    >
      <div class="card-body flex flex-col items-center gap-2 p-4">
        <img
          v-if="hobby.image && !failedImageIds.has(hobby.id)"
          :src="hobby.image"
          :alt="hobby.label"
          class="h-16 w-16 object-contain [filter:brightness(0)_invert(1)]"
          @error="handleImageError(hobby)"
        />
        <AppIcon v-else-if="!hobby.image" :name="hobby.icon" class="text-4xl text-white" />
        <span class="text-sm">{{ hobby.label }}</span>
      </div>
    </button>
  </div>
</template>
