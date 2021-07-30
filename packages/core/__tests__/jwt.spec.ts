import { decode, verify } from '../src/jwt';

const jwt_expired =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNza2w2SDRGR3NpLXE0QkVPT1BQOWJlbHNoRGFHZjd3RXViVU5KQllwQmsifQ.eyJzdWIiOiJ3anNadVc4VWpQd2ciLCJhdF9oYXNoIjoiM0V5QmZYbzVaX1pQSnRYQjIybnJ2USIsImF1ZCI6ImZvbyIsImV4cCI6MTYyNzYyNjk4NiwiaWF0IjoxNjI3NjIzMzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEvb2lkYyJ9.ReuVmyX5WrPhTGj5chK8muQZsbj5DRY1TTUulFImX0K2s7VBtSZf0vy9sNilJeG8urUv6YjQeeFArUAlg7UzIFwFGDDM8wX-6-sNyBl3JB8Uc88XG44xwEzh-kyBk095aiK39PxOG876RNEKWpjTg3fi4-SHTGXkFvEZHCCJ6Eq7v1lhBTIqW3yKF3Y0uYvNq6IFkb6imJtUoVoHPX9noLXSMRHh6HYi71jlanFFKCsJEjFfXDOmrfG9ULrzM00cB0WeOWh1ipyWYyxlh57EDmMCUIIT7onXwwgeIAS5eh1mfi9KLM7oRWfMNtxwJyRxXQ9XuWZk7KlT9aoSNfUVEKe00pL6KBQ0uevJRbTbuH0XhRmZF7Vt5v1BPusLjFRnYQ93V8hlgMx596jv2OXqMoWone0UqGlCJhXy9lZJF5L9EH2AdyAnDe0OQ3UvOjkxzDqBgKBhvdKKtkTU10ZR9GWHHSbY9DyccG7HLub8m3gULU8j-4p8LDCJhvLtv-8wF4tNgxC0wvwIWfJavTo3DcMoECAOyGluugaAgvDT5w04kr2MIinet1ana9YN8iWuKnG06srfNncyJzztLqLWOb1cMbbvodcehlCJZXlRVmAZ1BN4-sANu_jsRBRnF60mzxRk2lJajSy_YkBgt2YpiGj3UQfwC2ok4kkO72VRpbk';
const jwt_lasts_for_ever =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEvb2lkYyIsImlhdCI6MTYyNzYyOTM2OCwiZXhwIjo0MDg5MDc4OTY4LCJhdWQiOiJmb28iLCJzdWIiOiJ3anNadVc4VWpQd2ciLCJhdF9oYXNoIjoiM0V5QmZYbzVaX1pQSnRYQjIybnJ2USJ9.j4wF6DhmBJlEpRhYdvX36DVuzet2fxEcQypDcbauOmc';
const jwt_jwks =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNza2w2SDRGR3NpLXE0QkVPT1BQOWJlbHNoRGFHZjd3RXViVU5KQllwQmsifQ.eyJzdWIiOiJ3anNadVc4VWpQd2ciLCJhdF9oYXNoIjoiNGdoNnRtU05hMS1ONTlMZ0g5bVdOUSIsImF1ZCI6ImZvbyIsImV4cCI6MTYyNzYzNjYyMSwiaWF0IjoxNjI3NjMzMDIxLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEvb2lkYyJ9.XHECW2cHLB8q-K4Q6y9NLtesb-K1NHEKoQNkBjK07F83us8mqmJ_hVOME4KEV9syBRPaeALsA3W63y3JyD7rwwaANdDMXsnbQ7E4-AWnoNwR9oGTyHcrLxPyTUCeY5Wsl8zX2n-7GdA-tPxqq_sovA-xd1alpxn8C6f7NVkMAopVqhRYTvest98KMqL6YJCxLMIsi6lbuNBIgTDVNkZsL-qExpDMV48w_XBrHQpQtzk11G4_Y-IXEs6G5WoHL2MdoBDVJxIq8pSYqKOuxGcBQiSDpEX1pDpxMAL-uYaa_f7R7Y-5e5We9bq96YS3YreYnI4wwBOPnOUy31LYGtp-BJcF3hoAiU40y2XXrHq9hCBqeQ8bh4VPDiHQuadMclIxLE8bTPd6P6j7tYORuP5abbB0ZFeEhlcBQaohvyEKoPoHGyp1W0hPmHYSN6ITfwknCBmyH68i-PKCg1wc8NiWtufj_SQuT_CzCcG3eamXhsa_u8TCgtyPTFifGqdfp7S8cJdPh8uC4C3daBaymZeCIwGbN0vwG0Ky8zBoy_0iB6tyi8Jy1nhX-wePfxIbdV2aWe3PUcVeZGvo3-eIllp9jJL-rhwKEgDcZL7_DymzJg2enX8EpWWDoN6InkhD617Fy43uAtILX0rIMeF3ktvuy73qGiKpTrDFIWrY6rRaSuA';
describe('id_token', () => {
  test('id_token decoe', () => {
    const idToken = decode(jwt_lasts_for_ever);
    expect(idToken.aud).toEqual('foo');
  });
  test('id_token decode: expired', () => {
    expect(() => decode(jwt_expired)).toThrow();
  });
});

describe('jwks', () => {
  test('verify with remote jwks uri', async () => {
    const result = await verify({
      token: jwt_jwks,
      jwksUri: 'http://localhost:3001/oidc/jwks',
    });
    expect(result).not.toBeNull();
  });
});
