<script setup lang="ts">
import { useLogtoAccessToken, useLogtoUser } from '#imports';

const notAuthenticatedErrorCode = 'not_authenticated';

const user = useLogtoUser();

/**
 * The SDK-managed endpoint refreshes the token through the server session, so the browser can keep
 * calling APIs without a full page reload. The refresh token and the app secret stay on the server.
 */
const { accessToken, error, pending, refresh } = useLogtoAccessToken();
const resource = ref<{ data: string }>();

const callProtectedApi = async () => {
  resource.value = undefined;

  const token = await refresh();

  // No token means the session can no longer be refreshed; retrying would only loop.
  if (!token) {
    return;
  }

  resource.value = await $fetch('/api/protected-resource', {
    headers: { Authorization: `Bearer ${token}` },
  });
};
</script>

<template>
  <div>
    <p>Logto Nuxt 3 sample</p>
    <p v-if="Boolean(user)">Authenticated</p>
    <ul v-if="Boolean(user)">
      <li v-for="(value, key) in user" :key="key">
        <b>{{ key }}:</b> {{ value }}
      </li>
    </ul>

    <p v-if="Boolean(user)">
      <button :disabled="pending" @click="callProtectedApi">
        {{ pending ? 'Loading...' : 'Call protected API from the browser' }}
      </button>
    </p>

    <p v-if="accessToken">Access token: {{ accessToken }}</p>
    <p v-if="resource">Protected resource: {{ resource.data }}</p>

    <p v-if="error">
      <template v-if="error.code === notAuthenticatedErrorCode">
        The session has expired, please <a href="/sign-in">sign in</a> again.
      </template>
      <template v-else>
        Failed to get an access token ({{ error.statusCode }}: {{ error.code }}).
      </template>
    </p>

    <a :href="`/sign-${user ? 'out' : 'in'}`">Sign {{ user ? 'out' : 'in' }}</a>
  </div>
</template>
