<script setup lang="ts">
import { useDisclosure } from "@/composables/useDisclosure";

const props = withDefaults(defineProps<{ defaultOpen?: boolean }>(), {
  defaultOpen: false,
});

const { isOpen, toggle } = useDisclosure(props.defaultOpen);
</script>

<template>
  <div
    class="collapse-arrow bg-base-200 border-base-300 collapse border"
    :class="isOpen ? 'collapse-open' : 'collapse-close'"
  >
    <button
      type="button"
      class="collapse-title text-left font-medium"
      @click="toggle"
    >
      <slot name="title" />
    </button>
    <div class="collapse-content">
      <slot />
    </div>
  </div>
</template>
