<script setup lang="ts">
import { useLogto, type UserInfoResponse } from "@logto/vue";
import { RouterLink } from "vue-router";
import { ref } from "vue";
import { baseUrl, redirectUrl } from "../consts";

const { isAuthenticated, fetchUserInfo, signIn, signOut } = useLogto();
const user = ref<UserInfoResponse>();

const onClickSignIn = () => {
  void signIn(redirectUrl);
};

const onClickSignOut = () => {
  void signOut(baseUrl);
};

if (isAuthenticated.value) {
  (async () => {
    const info = await fetchUserInfo();
    user.value = info;
  })();
}
</script>

<template>
  <div class="container">
    <h3>Logto Vue Sample</h3>
    <button v-if="!isAuthenticated" @click="onClickSignIn">Sign In</button>
    <button v-else @click="onClickSignOut">Sign Out</button>
    <div v-if="isAuthenticated && user">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in user" v-bind:key="key">
            <td>{{ key }}</td>
            <td>
              {{ typeof value === "string" ? value : JSON.stringify(value) }}
            </td>
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
