import { extractBearerToken, LogtoClient } from '.';

describe('extractBearerToken', () => {
  test('bearer testtoken', () => {
    const token = extractBearerToken('bearer testtoken');
    expect(token).toEqual('testtoken');
  });
  test('Bearer testtoken', () => {
    const token = extractBearerToken('Bearer testtoken');
    expect(token).toEqual('testtoken');
  });
  test('bearertesttoken', () => {
    expect(() => extractBearerToken('bearertesttoken')).toThrow();
  });
  test('testtoken', () => {
    expect(() => extractBearerToken('testtoken')).toThrow();
  });
  test('empty string', () => {
    expect(() => extractBearerToken('')).toThrow();
  });
  test('empty input', () => {
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    expect(() => extractBearerToken()).toThrow();
  });
});

// Need to be changed into e2e test
// describe('login', () => {

//   let client: LogtoClient;
//   beforeAll((done) => {
//     client = new LogtoClient(
//       {
//         logtoUrl: 'https://logto.dev',
//         clientId: 'foo',
//       },
//       done
//     );
//   });
//   test('openid configuration', async () => {
//     const configuration = client.issuer?.metadata;
//     expect(configuration?.authorization_endpoint).toContain('oidc/auth');
//   });
//   test('get login url and codeVerifier', () => {
//     const [url, codeVerifier] = client.getLoginUrlAndCodeVerifier('http://localhost:3000/callback');
//     console.log(url);
//     console.log(codeVerifier);
//     expect(typeof url).toEqual('string');
//     expect(typeof codeVerifier).toEqual('string');
//   });
//   test('handle callback and get tokenset', async () => {
//     if (!process.env.CODE || !process.env.CODE_VERIFIER) {
//       // Skip
//       expect(1).toEqual(1);
//     }

//     const tokenset = await client.handleLoginCallback(
//       'http://localhost:3000/callback',
//       process.env.CODE_VERIFIER || '',
//       process.env.CODE || ''
//     );
//     expect(tokenset).not.toBeNull();
//   });
// });

const access_token = 'TvuiR2kU_38PtQcZJM8NFF8I4-0lWnr8C5eWsTmCOON';
const refresh_token = 'icveztdOZ879up1vSsKMFjLzscKBJ44kIoXMKlWeunN';
const id_token =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNza2w2SDRGR3NpLXE0QkVPT1BQOWJlbHNoRGFHZjd3RXViVU5KQllwQmsifQ.eyJzdWIiOiJ3anNadVc4VWpQd2ciLCJhdF9oYXNoIjoiUkhQejU1YnlHcS1wODFoZnpHVllmQSIsImF1ZCI6ImZvbyIsImV4cCI6MTYzMjgxMjIyNSwiaWF0IjoxNjMyODA4NjI1LCJpc3MiOiJodHRwczovL2xvZ3RvLmRldi9vaWRjIn0.RVAHwv6Zpqz-QuUFLsyr4RomNA7OdeyIyIlXPsnUlg0TG8Vfp2EiR2LMaVFYWQVF-ZlUohZYIoBh6WDi_ZosBbWTOA9J15Jxfyh--0Lv_8F_rLnHiAjnEzCgkQkjrDdEucZuWXgJyKbmFllEbzT_pjEh9MJcoP1g15_wtTbUAyPNfLq4gCj7atvricbr1Yg_1j1rTHWC_9PyaM6TvpL2riBvVZJOapLkw3ueKvSsTMot5k7lF_7bLIpXMrQkRcUpRG16MxBYyu1RdkDrYBowOUkQ_wL57628wKF4D7f12oLxvznzIOIQpsEgG9fja7p2-o05nw9hb-Qxbczb9J0fBjTo4SPf97QEqKFpDYVwC50Ix7jArIDcX6f5SBMGOlYNLgS97LYZWH8qyDqLGuEiE2Crqajh9CAN95AQ0Fi9GoKjCfLC_wxiJFLA0kI6OO2EpuRE09v3Yca3Mtb6DgsgwlIrgz_SEbwVglGKp1D93SfmKVg8v1nUP79SXA0xMLUNIFw6gycqHuBYVqYx6NX2Z9WsVqx4gT4RBZdRDD4eVMEPYnZqFgInFkeAsriZsnq3Fj5aVcdzNgp0UPZmjzNlHudDM5ABvkyi88ao-St0DyP2IQtIqJ-xQOmfwH1N_zPBPy_KTKItPFyYdjQbfY6OvKNuA7nDuUuCSzG8KpBPPG4';
const scope = 'openid offline_access';
const token_type = 'Bearer';

describe('setToken', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        logtoUrl: 'https://logto.dev',
        clientId: 'foo',
      },
      () => {
        client.setToken({
          access_token,
          expires_at: Math.floor(Date.now() / 1000) + 1000,
          id_token,
          refresh_token,
          scope,
          token_type,
        });
        done();
      }
    );
  });

  test('should be authenticated', () => {
    expect(client.authenticated).toBeTruthy();
  });

  test('should have token', () => {
    expect(client.token).toEqual(access_token);
  });

  test('should have id_token', () => {
    expect(client.idToken).toEqual(id_token);
  });

  test('should have subject', () => {
    expect(client.subject).toEqual('wjsZuW8UjPwg');
  });
});

describe('setToken with expired input', () => {
  let client: LogtoClient;
  beforeAll((done) => {
    client = new LogtoClient(
      {
        logtoUrl: 'https://logto.dev',
        clientId: 'foo',
      },
      () => {
        client.setToken({
          access_token,
          expires_at: Math.floor(Date.now() / 1000) - 1,
          id_token,
          refresh_token,
          scope,
          token_type,
        });
        done();
      }
    );
  });

  test('should not be authenticated', () => {
    expect(client.authenticated).toBeFalsy();
  });

  test('should throw on getting token', () => {
    expect(() => client.token).toThrow();
  });
});
