import { ref } from "vue";

/** Open/closed toggle state shared by every collapsible section in the app. */
export function useDisclosure(defaultOpen = false) {
  const isOpen = ref(defaultOpen);

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, toggle, open, close };
}
