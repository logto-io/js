<script setup lang="ts">
import { useLogto, type IdTokenClaims } from "@logto/vue";
import { RouterLink } from "vue-router";
import { ref, watchEffect } from "vue";
import { baseUrl, redirectUrl } from "../consts";

const { isAuthenticated, getIdTokenClaims, signIn, signOut } = useLogto();
const idTokenClaims = ref<IdTokenClaims>();

const onClickSignIn = () => {
  void signIn(redirectUrl);
};

const onClickSignOut = () => {
  void signOut(baseUrl);
};

watchEffect(async () => {
  if (isAuthenticated.value) {
    const claims = await getIdTokenClaims();
    idTokenClaims.value = claims;
  }
});
</script>

<template>
  <div class="container">
    <h3>Logto Vue Sample</h3>
    <button v-if="!isAuthenticated" @click="onClickSignIn">Sign In</button>
    <button v-else @click="onClickSignOut">Sign Out</button>
    <div v-if="isAuthenticated && idTokenClaims">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in idTokenClaims" v-bind:key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
      <RouterLink to="/protected-resource">View Protected Resource</RouterLink>
    </div>
  </div>
</template>

<style lang="scss">
.container {
  padding: 20px;
}

.table {
  margin: 50px auto;
  table-layout: fixed;
  width: 800px;
  border: 1px solid #333;
  border-spacing: 0;

  th,
  td {
    padding: 10px;
    word-wrap: break-word;
    border: 1px solid #333;
  }

  th {
    font-weight: bold;
  }
}
</style>
