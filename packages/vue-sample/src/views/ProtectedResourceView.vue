<script lang="ts">
import { useLogto } from "@logto/vue";
import { onMounted } from "vue";

import { redirectUrl } from "../consts";

export default {
  setup() {
    const { isAuthenticated, isLoading, signIn } = useLogto();

    onMounted(() => {
      if (!isAuthenticated.value && !isLoading.value) {
        void signIn(redirectUrl);
      }
    });

    return {
      isAuthenticated,
    };
  },
};
</script>
<template>
  <p v-if="isAuthenticated">
    Protected resource is only visible after sign-in.
  </p>
</template>
