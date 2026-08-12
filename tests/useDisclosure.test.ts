import { describe, it, expect } from "vitest";
import { useDisclosure } from "../src/composables/useDisclosure.ts";

describe("useDisclosure", () => {
  it("defaults to closed", () => {
    const { isOpen } = useDisclosure();
    expect(isOpen.value).toBe(false);
  });

  it("honors a defaultOpen argument", () => {
    const { isOpen } = useDisclosure(true);
    expect(isOpen.value).toBe(true);
  });

  it("toggle flips the current state", () => {
    const { isOpen, toggle } = useDisclosure();
    toggle();
    expect(isOpen.value).toBe(true);
    toggle();
    expect(isOpen.value).toBe(false);
  });

  it("open/close set state directly regardless of current value", () => {
    const { isOpen, open, close } = useDisclosure();
    open();
    open();
    expect(isOpen.value).toBe(true);
    close();
    close();
    expect(isOpen.value).toBe(false);
  });
});
