import { useLogto } from '@logto/solid';
import { createSignal, onMount } from 'solid-js';

const Organizations = () => {
  const { getOrganizationToken, getOrganizationTokenClaims, getIdTokenClaims } = useLogto();
  const [organizationIds, setOrganizationIds] = createSignal<string[]>();

  onMount(() => {
    (async () => {
      const claims = await getIdTokenClaims();

      console.log('ID token claims', claims);
      setOrganizationIds(claims?.organizations);
    })();
  });

  return (
    <section>
      <h2>Organizations</h2>
      <a href="/">Go back</a>
      {organizationIds()?.length === 0 && <p>No organization memberships found.</p>}
      <ul>
        {organizationIds()?.map((organizationId) => {
          return (
            <li style={{ display: 'flex', 'align-items': 'center', gap: '8' }}>
              <span>{organizationId}</span>
              <button
                type="button"
                onClick={async () => {
                  console.log('raw token', await getOrganizationToken(organizationId));
                  console.log('claims', await getOrganizationTokenClaims(organizationId));
                }}
              >
                fetch token (see console)
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Organizations;
