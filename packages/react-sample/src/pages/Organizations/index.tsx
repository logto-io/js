import { useLogto } from '@logto/react';
import { useEffect, useState } from 'react';

const Organizations = () => {
  const { getOrganizationToken, getOrganizationTokenClaims, getIdTokenClaims } = useLogto();
  const [organizationIds, setOrganizationIds] = useState<string[]>();

  useEffect(() => {
    (async () => {
      const claims = await getIdTokenClaims();

      console.log('ID token claims', claims);
      setOrganizationIds(claims?.organizations);
    })();
  }, [getIdTokenClaims]);

  return (
    <section>
      <h2>Organizations</h2>
      <a href="/">Go back</a>
      {organizationIds?.length === 0 && <p>No organization memberships found.</p>}
      <ul>
        {organizationIds?.map((organizationId) => {
          return (
            <li key={organizationId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
