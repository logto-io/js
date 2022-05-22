<script lang="ts">
import { useHandleSignInCallback } from "@logto/vue";

export default {
  setup() {
    const { isLoading } = useHandleSignInCallback();

    return {
      isLoading,
    };
  },
};
</script>
<template>
  <p v-if="isLoading">Redirecting...</p>
</template>
