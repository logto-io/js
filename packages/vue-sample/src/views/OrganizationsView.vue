<script setup lang="ts">
import { useLogto } from "@logto/vue";
import { onMounted, ref } from "vue";

const { getOrganizationToken, getOrganizationTokenClaims, getIdTokenClaims } =
  useLogto();
const organizationIds = ref<string[]>();

onMounted(async () => {
  const claims = await getIdTokenClaims();

  console.log("ID token claims", claims);
  organizationIds.value = claims?.organizations;
});

const onClickFetchOrgToken = async (organizationId: string) => {
  console.log("raw token", await getOrganizationToken(organizationId));
  console.log("claims", await getOrganizationTokenClaims(organizationId));
};
</script>

<template>
  <section>
    <h2>Organizations</h2>
    <RouterLink to="/">Go back</RouterLink>
    <p v-if="organizationIds?.length === 0">
      No organization memberships found.
    </p>
    <ul>
      <li
        v-for="organizationId of organizationIds"
        v-bind:key="organizationId"
        style="display: flex; align-items: center; gap: 8px"
      >
        <span>{{ organizationId }}</span>
        <button type="button" @click="onClickFetchOrgToken(organizationId)">
          fetch token (see console)
        </button>
      </li>
    </ul>
  </section>
</template>
