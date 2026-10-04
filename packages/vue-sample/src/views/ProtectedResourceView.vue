<script setup lang="ts">
import { useLogto } from "@logto/vue";
import { onMounted, ref } from "vue";
import { redirectUrl, resource } from "../consts";

const { isAuthenticated, isLoading, signIn, getAccessToken } = useLogto();
const accessToken = ref<string>();

onMounted(() => {
  if (!isAuthenticated.value && !isLoading.value) {
    void signIn(redirectUrl);
  }
});

const handleClick = async () => {
  const token = await getAccessToken(resource);
  accessToken.value = token;
};
</script>

<template>
  <section>
    <RouterLink to="/">Go back</RouterLink>
    <p v-if="isAuthenticated">
      Protected resource is only visible after sign-in.
    </p>
    <button type="button" @click="handleClick">Get access token</button>
    <p v-if="accessToken">
      Access token: <code>{{ accessToken }}</code>
    </p>
  </section>
</template>
