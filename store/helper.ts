import { ref } from "@mpxjs/core";
import { defineStore } from "@mpxjs/pinia";

export const useHperStore = defineStore("helper", () => {
  const navBarHeight = ref(0);
  const capsuleHeight = ref(0);
  const capsuleBottom = ref(0);

  return {
    navBarHeight,
    capsuleHeight,
    capsuleBottom,
  };
});
