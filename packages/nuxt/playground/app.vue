<script setup lang="ts">

const client = useLogtoClient();
const accessToken = useState<string | undefined>('access-token');

await callOnce(async () => {
  if (!client) {
    throw new Error('Logto client is not available');
  }

  if (!(await client.isAuthenticated())) {
    return;
  }

  try {
    accessToken.value = await client.getAccessToken();
  } catch (error) {
    console.error('Failed to get access token', error);
  }
});

const user = useLogtoUser();

</script>
<template>
  <div>
    <p>Logto Nuxt 3 sample</p>
    <p v-if="Boolean(user)">Authenticated</p>
    <ul v-if="Boolean(user)">
      <li v-for="(value, key) in user">
        <b>{{ key }}:</b> {{ value }}
      </li>
    </ul>
    <p v-if="Boolean(user)">Access token: {{ accessToken }}</p>
    <a :href="`/sign-${ user ? 'out' : 'in' }`">
      Sign {{ user ? 'out' : 'in' }}
    </a>
  </div>
</template>
