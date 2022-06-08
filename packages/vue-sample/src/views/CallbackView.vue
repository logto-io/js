<script setup lang="ts">
import { useHandleSignInCallback } from "@logto/vue";
import router from "@/router";

const { isLoading } = useHandleSignInCallback(() => {
  router.push("/");
});
</script>

<template>
  <p v-if="isLoading">Redirecting...</p>
</template>
