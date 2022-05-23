<script setup lang="ts">
import { useHandleSignInCallback } from "@logto/vue";
const { isLoading } = useHandleSignInCallback();
</script>

<template>
  <p v-if="isLoading">Redirecting...</p>
</template>
