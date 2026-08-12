<script setup lang="ts">
import { ref, computed } from "vue";
import { hobbies } from "@/generated/hobbies";
import HobbyGrid from "@/components/HobbyGrid.vue";
import HobbyDetailPanel from "@/components/HobbyDetailPanel.vue";
import { usePageHead } from "@/head";

usePageHead({ title: "Hobbies", path: "/hobbies" });

const selectedId = ref<string | null>(null);
const selectedHobby = computed(
  () => hobbies.find((hobby) => hobby.id === selectedId.value) ?? null,
);

function select(id: string) {
  selectedId.value = selectedId.value === id ? null : id;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold">Hobbies</h1>
    <HobbyGrid :hobbies="hobbies" :selected-id="selectedId" @select="select" />
    <HobbyDetailPanel v-if="selectedHobby" :hobby="selectedHobby" />
  </div>
</template>
