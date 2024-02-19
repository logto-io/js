<script>
  /** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>Welcome to SvelteKit</h1>

{#if data.user}
  <p>Authenticated</p>
  <ul>
    {#each Object.entries(data.user) as [key, value]}
      <li>{key}: {value}</li>
    {/each}
    </ul>
{/if}

<form method="POST" action="?/{data.user ? 'signOut' : 'signIn'}">
  <button type="submit">Sign {data.user ? 'out' : 'in'}</button>
</form>
