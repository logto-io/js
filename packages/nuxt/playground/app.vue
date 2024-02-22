<script setup lang="ts">

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
    <a :href="`/sign-${ user ? 'out' : 'in' }`">
      Sign {{ user ? 'out' : 'in' }}
    </a>
  </div>
</template>
